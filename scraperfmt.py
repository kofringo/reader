import os
import time
import cloudscraper
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# --- SECURE CONFIGURATION ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def scrape_novel_metadata(novel_main_url):
    print(f"\n==================================================")
    print(f"🔍 Fetching Novel Info from FanMTL: {novel_main_url}")
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
    cover_url = None
    cover_elem = soup.find('div', class_='book-img') or soup.find('div', class_='pic')
    if cover_elem and cover_elem.find('img'):
        cover_url = cover_elem.find('img').get('src')
        if cover_url and cover_url.startswith('/'):
            cover_url = "https://fanmtl.com" + cover_url

    # 2. Extract Title
    title_tag = soup.find('h1') or soup.find('div', class_='book-name')
    title = title_tag.get_text(strip=True) if title_tag else "Unknown Novel"

    # 3. Extract Author & Genre
    author = "Unknown Author"
    genres = ""
    
    author_label = soup.find(string=lambda t: t and 'Author:' in t)
    if author_label and author_label.find_parent():
        parent = author_label.find_parent()
        author_elem = parent.find('a')
        if author_elem:
            author = author_elem.get_text(strip=True)
            
    genre_elems = soup.find_all('a', href=lambda h: h and 'genre' in h)
    if genre_elems:
        genres = ", ".join([g.get_text(strip=True) for g in genre_elems])

    # 4. Extract Summary
    summary_div = soup.find('div', class_='summary') or soup.find('div', class_='intro') or soup.find('div', class_='desc')
    summary = summary_div.get_text(separator="\n", strip=True) if summary_div else ""

    return {
        'title': title,
        'author': author,
        'genre': genres,
        'summary': summary,
        'cover_url': cover_url
    }


def update_novel_chapter_count(novel_id):
    count_res = supabase.table('chapters') \
        .select('*', count='exact', head=True) \
        .eq('novel_id', novel_id) \
        .execute()
    
    total_chapters = count_res.count if count_res.count is not None else 0

    supabase.table('novels') \
        .update({'chapter_count': total_chapters}) \
        .eq('id', novel_id) \
        .execute()
    
    print(f"📊 Updated chapter_count to {total_chapters} for Novel ID: {novel_id}")


def get_or_create_novel(meta):
    title = meta['title']
    existing = supabase.table('novels').select('*').eq('title', title).execute()
    
    slug = title.lower().replace(" ", "-").replace(":", "").replace("'", "")
    novel_data = {
        'title': title,
        'author': meta['author'],
        'genre': meta['genre'],
        'summary': meta['summary'],
        'slug': slug
    }

    if existing.data:
        novel_id = existing.data[0]['id']
        
        # Preserve manual or previously saved cover_url if scraper couldn't find one
        if meta['cover_url']:
            novel_data['cover_url'] = meta['cover_url']
        elif existing.data[0].get('cover_url'):
            novel_data['cover_url'] = existing.data[0]['cover_url']

        supabase.table('novels').update(novel_data).eq('id', novel_id).execute()
        print(f"✅ Metadata updated in Supabase safely (ID: {novel_id})")
        return novel_id
    else:
        if meta['cover_url']:
            novel_data['cover_url'] = meta['cover_url']
            
        res = supabase.table('novels').insert(novel_data).execute()
        novel_id = res.data[0]['id']
        print(f"🎉 New Novel created in Supabase (ID: {novel_id})")
        return novel_id


def scrape_novel_batch(novel_info):
    main_url = novel_info["main_url"]
    chapter_pattern = novel_info["chapter_pattern"]
    start_chap = novel_info["start_chap"]
    end_chap = novel_info["end_chap"]

    meta = scrape_novel_metadata(main_url)
    if not meta:
        return

    print(f"📖 Title:   {meta['title']}")
    print(f"✍️ Author:  {meta['author']}")
    print(f"🏷️ Genre:   {meta['genre']}\n")

    novel_id = get_or_create_novel(meta)

    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
    )

    for chap_num in range(start_chap, end_chap + 1):
        chapter_url = chapter_pattern.format(chap_num)

        try:
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
            
            content_div = soup.find('div', class_='chapter-content')
            if not content_div:
                print(f"⚠️ Content not found for Chapter {chap_num}")
                continue

            # Robust Chapter Title extraction for FanMTL
            chapter_title = f"Chapter {chap_num}"
            titles_div = soup.find('div', class_='titles')
            if titles_div:
                spans = titles_div.find_all('span')
                for span in spans:
                    text = span.get_text(strip=True)
                    if f"Chapter {chap_num}" in text or len(text) > 3:
                        chapter_title = text
                        break
                if chapter_title == f"Chapter {chap_num}":
                    text = titles_div.get_text(strip=True)
                    if meta['title'] in text:
                        chapter_title = text.replace(meta['title'], "").strip()
            
            if not chapter_title:
                chapter_title = f"Chapter {chap_num}"

            paragraphs = content_div.find_all('p')
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

        time.sleep(1)

    update_novel_chapter_count(novel_id)


if __name__ == "__main__":
    NOVELS_TO_SCRAPE = [
        {
            "main_url": "https://fanmtl.com/novel/wizard-of-all-souls.html",
            "chapter_pattern": "https://fanmtl.com/novel/wizard-of-all-souls_{}.html",
            "start_chap": 51,   # Adjust this to 51 or higher when adding subsequent chapters later
            "end_chap": 985    # Adjust this to your new end target chapter
        }
    ]

    print("🚀 Starting FanMTL Batch Scraping Engine...")
    for novel in NOVELS_TO_SCRAPE:
        scrape_novel_batch(novel)
        time.sleep(2)
    print("\n🎉 All FanMTL scraping tasks finished!")