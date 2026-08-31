import os
import time
import requests
import cloudscraper
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# --- SECURE CONFIGURATION ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = "wizard-of-all-souls"  # Your Supabase storage bucket name

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def notify_indexnow(slug):
    """Instantly pings Bing and IndexNow participating search engines when a novel is updated/created."""
    host = "www.webnovelreader.com"
    key = "84552e3af88c4263aa6a"  # Your IndexNow API Key matching your public text file
    novel_url = f"https://{host}/novel/{slug}"
    
    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": [novel_url]
    }
    
    try:
        response = requests.post("https://api.indexnow.org/indexnow", json=payload)
        if response.status_code == 200:
            print(f"🚀 IndexNow notified successfully for: {novel_url}")
        else:
            print(f"⚠️ IndexNow notification returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Error pinging IndexNow: {e}")


def upload_cover_to_supabase(cover_url, slug):
    """Downloads cover image from external URL and uploads it directly to Supabase storage."""
    if not cover_url:
        return None

    try:
        print(f"📥 Downloading cover image from external source...")
        img_response = requests.get(cover_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        
        if img_response.status_code != 200:
            print(f"⚠️ Failed to download cover image (Status {img_response.status_code})")
            return cover_url  # Fallback to external URL if download fails

        image_data = img_response.content
        file_name = f"{slug}.jpg"

        print(f"☁️ Uploading cover to Supabase bucket '{BUCKET_NAME}'...")
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_name,
            file=image_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )

        # Return the relative path route that maps to your Next.js custom API route
        relative_route = f"/images/{file_name}"
        print(f"✅ Cover successfully routed to: {relative_route}")
        return relative_route

    except Exception as e:
        print(f"❌ Error uploading cover image to Supabase: {e}")
        return cover_url


def scrape_novel_metadata(novel_main_url, slug):
    print(f"\n==================================================")
    print(f"🔍 Fetching Novel Info from: {novel_main_url}")
    print(f"==================================================")
    
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
    )
    
    res = scraper.get(novel_main_url)
    if res.status_code != 200:
        print(f"❌ Failed to fetch main page (Status {res.status_code})")
        return None

    soup = BeautifulSoup(res.text, 'html.parser')
    
    # 1. Extract Cover Image
    cover_img = soup.find('div', class_='pic')
    cover_url = None
    if cover_img and cover_img.find('img'):
        cover_url = cover_img.find('img').get('src')
        if cover_url and cover_url.startswith('/'):
            cover_url = "https://freewebnovel.com" + cover_url

    # Upload and handle cover URL routing immediately
    final_cover_url = upload_cover_to_supabase(cover_url, slug)

    # 2. Extract Title
    title_tag = soup.find('h1', class_='tit') or soup.find('h3', class_='title')
    title = title_tag.get_text(strip=True) if title_tag else "Unknown Novel"

    # 3. Extract Author & Genre
    author = "Unknown Author"
    genres = ""
    
    info_div = soup.find('div', class_='m-imgtxt') or soup.find('div', class_='txt')
    if info_div:
        author_elem = info_div.find('a', href=lambda h: h and '/author/' in h)
        if author_elem:
            author = author_elem.get_text(strip=True)
            
        genre_elems = info_div.find_all('a', href=lambda h: h and '/genre/' in h)
        if genre_elems:
            genres = ", ".join([g.get_text(strip=True) for g in genre_elems])

    # 4. Extract Summary
    summary_div = soup.find('div', class_='inner') or soup.find('div', class_='desc') or soup.find('div', class_='summary')
    summary = ""
    if summary_div:
        summary = summary_div.get_text(separator="\n", strip=True).replace("SUMMARY", "").strip()

    return {
        'title': title,
        'author': author,
        'genre': genres,
        'summary': summary,
        'cover_url': final_cover_url
    }


def get_or_create_novel(meta, slug):
    title = meta['title']
    existing = supabase.table('novels').select('id').eq('title', title).execute()
    
    novel_data = {
        'title': title,
        'author': meta['author'],
        'genre': meta['genre'],
        'summary': meta['summary'],
        'cover_url': meta['cover_url'],
        'slug': slug
    }

    if existing.data:
        novel_id = existing.data[0]['id']
        supabase.table('novels').update(novel_data).eq('id', novel_id).execute()
        print(f"✅ Metadata updated in Supabase (ID: {novel_id})")
    else:
        res = supabase.table('novels').insert(novel_data).execute()
        novel_id = res.data[0]['id']
        print(f"🎉 New Novel created in Supabase (ID: {novel_id})")

    # Automatically ping Bing via IndexNow whenever a novel is processed
    notify_indexnow(slug)
    return novel_id


def scrape_novel_batch(novel_info):
    main_url = novel_info["main_url"]
    chapter_pattern = novel_info["chapter_pattern"]
    start_chap = novel_info["start_chap"]
    end_chap = novel_info["end_chap"]

    # Generate slug upfront from the URL or title logic
    # (Extracting a clean slug from the main url path)
    slug = main_url.rstrip("/").split("/")[-1]

    meta = scrape_novel_metadata(main_url, slug)
    if not meta:
        return

    print(f"📖 Title:   {meta['title']}")
    print(f"✍️ Author:  {meta['author']}")
    print(f"🏷️ Genre:   {meta['genre']}\n")

    novel_id = get_or_create_novel(meta, slug)

    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
    )

    for chap_num in range(start_chap, end_chap + 1):
        chapter_url = chapter_pattern.format(chap_num)

        try:
            # Check if chapter already exists in database before scraping
            existing_chap = supabase.table('chapters') \
                .select('id') \
                .eq('novel_id', novel_id) \
                .eq('chapter_number', chap_num) \
                .execute()

            if existing_chap.data:
                print(f"⏭️ Chapter {chap_num} already exists. Skipping...")
                continue

            print(f"[Chapter {chap_num}] Scraping: {chapter_url}")
            response = scraper.get(chapter_url)
            
            if response.status_code != 200:
                print(f"❌ Chapter {chap_num} returned status {response.status_code}")
                continue

            soup = BeautifulSoup(response.text, 'html.parser')
            article_div = soup.find('div', id='article')

            if not article_div:
                print(f"⚠️ Content not found for Chapter {chap_num}")
                continue

            h4_title = article_div.find('h4')
            chapter_title = h4_title.get_text(strip=True) if h4_title else f"Chapter {chap_num}"

            paragraphs = article_div.find_all('p')
            content = "\n\n".join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])

            supabase.table('chapters').insert({
                'novel_id': novel_id,
                'chapter_number': chap_num,
                'title': chapter_title,
                'content': content
            }).execute()

            print(f"✅ Chapter {chap_num} uploaded successfully!")

        except Exception as e:
            print(f"❌ Error on Chapter {chap_num}: {e}")

        # Politeness delay between request spikes
        time.sleep(1)


if __name__ == "__main__":
    # --- LIST OF NOVELS TO SCRAPE ---
    NOVELS_TO_SCRAPE = [
        {
            "main_url": "https://freewebnovel.com/novel/naval-gacha-system-its-time-to-monopolize-the-seven-seas",
            "chapter_pattern": "https://freewebnovel.com/novel/naval-gacha-system-its-time-to-monopolize-the-seven-seas/chapter-{}",
            "start_chap": 1,
            "end_chap": 322
        },
        {
            "main_url": "https://freewebnovel.com/novel/perverted-step-dad-system",
            "chapter_pattern": "https://freewebnovel.com/novel/perverted-step-dad-system/chapter-{}",
            "start_chap": 1,
            "end_chap": 82
        },
        {
            "main_url": "https://freewebnovel.com/novel/nine-nether-heavenly-emperor",
            "chapter_pattern": "https://freewebnovel.com/novel/nine-nether-heavenly-emperor/chapter-{}",
            "start_chap": 1,
            "end_chap": 1000
        },
        {
             "main_url": "https://freewebnovel.com/novel/i-tame-beasts-by-feeding",
             "chapter_pattern": "https://freewebnovel.com/novel/i-tame-beasts-by-feeding/chapter-{}",
             "start_chap": 1,
             "end_chap": 309
        },
        {
             "main_url": "https://freewebnovel.com/novel/starting-with-an-sss-rank-goddess-summon",
             "chapter_pattern": "https://freewebnovel.com/novel/starting-with-an-sss-rank-goddess-summon/chapter-{}",
             "start_chap": 1,
             "end_chap": 401
        },
        {
             "main_url": "https://freewebnovel.com/novel/strongest-kingdom-my-op-kingdom-got-transported-along-with-me",
             "chapter_pattern": "https://freewebnovel.com/novel/strongest-kingdom-my-op-kingdom-got-transported-along-with-me/chapter-{}",
             "start_chap": 1,
             "end_chap": 436
        },
        {
            "main_url": "https://freewebnovel.com/novel/the-insane-regressor-throne-of-pride",
            "chapter_pattern": "https://freewebnovel.com/novel/the-insane-regressor-throne-of-pride/chapter-{}",
            "start_chap": 1,
            "end_chap": 168
        },
        {
            "main_url": "https://freewebnovel.com/novel/monarch-of-the-abyss",
            "chapter_pattern": "https://freewebnovel.com/novel/monarch-of-the-abyss/chapter-{}",
            "start_chap": 1,
            "end_chap": 219
        },
        {
            "main_url": "https://freewebnovel.com/novel/wizard-starting-from-the-skill-tree",
            "chapter_pattern": "https://freewebnovel.com/novel/wizard-starting-from-the-skill-tree/chapter-{}",
            "start_chap": 1,
            "end_chap": 971
        },
        {
            "main_url": "https://freewebnovel.com/novel/enlightenment-attaining-the-dao-at-age-8",
            "chapter_pattern": "https://freewebnovel.com/novel/enlightenment-attaining-the-dao-at-age-8/chapter-{}",
            "start_chap": 1,
            "end_chap": 648
        }
    ]

    print("🚀 Starting Batch Scraping Engine...")
    for novel in NOVELS_TO_SCRAPE:
        scrape_novel_batch(novel)
        time.sleep(2)  # Delay between novel batches
    print("\n🎉 All scraping tasks finished!")