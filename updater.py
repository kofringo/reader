import os
import time
import cloudscraper
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client
import requests

# --- SECURE CONFIGURATION ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_latest_local_chapter(novel_id: str) -> int:
    """Finds the highest chapter number stored locally in Supabase for this novel."""
    res = supabase.table('chapters') \
        .select('chapter_number') \
        .eq('novel_id', novel_id) \
        .order('chapter_number', desc=True) \
        .limit(1) \
        .execute()
    
    if res.data:
        return res.data[0]['chapter_number']
    return 0


def update_ongoing_novels():
    print("\n==================================================")
    print("🔍 Checking Supabase for Ongoing Novels to Update...")
    print("==================================================")

    # Fetch all ongoing novels from Supabase
    response = supabase.table('novels') \
        .select('id, title, slug') \
        .ilike('status', 'ongoing') \
        .execute()

    ongoing_novels = response.data

    if not ongoing_novels:
        print("📭 No ongoing novels found in Supabase.")
        return

    print(f"📚 Found {len(ongoing_novels)} ongoing novel(s) to check.\n")

    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
    )

    for novel in ongoing_novels:
        novel_id = novel['id']
        title = novel['title']
        slug = novel['slug']
        
        # Reconstruct the FreeWebNovel main URL from the slug
        main_url = f"https://freewebnovel.com/novel/{slug}"
        print(f"--------------------------------------------------")
        print(f"📖 Checking: {title}")
        print(f"🔗 URL: {main_url}")

        # Find the highest chapter number already in Supabase
        latest_local_chap = get_latest_local_chapter(novel_id)
        print(f"📌 Latest local chapter in DB: {latest_local_chap}")

        # Start probing for new chapters incrementally from the next chapter onwards
        next_chap_to_check = latest_local_chap + 1
        consecutive_failures = 0
        max_consecutive_failures = 3  # Stop probing if 3 chapters in a row don't exist yet

        while consecutive_failures < max_consecutive_failures:
            chapter_url = f"{main_url}/chapter-{next_chap_to_check}"
            
            try:
                print(f"🔎 Probing Chapter {next_chap_to_check}...")
                res = scraper.get(chapter_url, timeout=10)

                if res.status_code != 200:
                    consecutive_failures += 1
                    print(f"❌ Chapter {next_chap_to_check} not found yet (Status {res.status_code}). Failure count: {consecutive_failures}/{max_consecutive_failures}")
                    next_chap_to_check += 1
                    time.sleep(1)
                    continue

                soup = BeautifulSoup(res.text, 'html.parser')
                article_div = soup.find('div', id='article')

                if not article_div:
                    consecutive_failures += 1
                    print(f"⚠️ Article content container missing for Chapter {next_chap_to_check}.")
                    next_chap_to_check += 1
                    time.sleep(1)
                    continue

                # Reset failure counter since we found a valid new chapter!
                consecutive_failures = 0

                h4_title = article_div.find('h4')
                chapter_title = h4_title.get_text(strip=True) if h4_title else f"Chapter {next_chap_to_check}"

                paragraphs = article_div.find_all('p')
                content = "\n\n".join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])

                # Insert the new chapter into Supabase
                supabase.table('chapters').insert({
                    'novel_id': novel_id,
                    'chapter_number': next_chap_to_check,
                    'title': chapter_title,
                    'content': content
                }).execute()

                print(f"🎉 SUCCESS: Downloaded and added Chapter {next_chap_to_check} for '{title}'!")
                next_chap_to_check += 1

            except Exception as e:
                print(f"❌ Error checking Chapter {next_chap_to_check}: {e}")
                consecutive_failures += 1
                next_chap_to_check += 1

            time.sleep(1) # Politeness delay between requests

        print(f"✅ Finished checking updates for: {title}\n")
        time.sleep(2)

    print("🎉 All ongoing novels update checks completed!")


if __name__ == "__main__":
    update_ongoing_novels()



# Call your Next.js revalidation endpoint
requests.get("https://yourdomain.com/api/revalidate?secret=YOUR_SECRET_TOKEN")