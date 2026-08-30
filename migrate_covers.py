import os
import requests
from supabase import create_client, Client

# Your Supabase project credentials
SUPABASE_URL = "https://qdddnsyjvdewcxtghhth.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY" # Use service role key to bypass RLS for admin updates
BUCKET_NAME = "wizard-of-all-souls"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def migrate_covers():
    # 1. Fetch novels that still have external cover URLs
    response = supabase.table("novels").select("id, title, cover_url").like("cover_url", "%freewebnovel.com%").execute()
    novels = response.data

    print(f"Found {len(novels)} novels with external covers to migrate.")

    for novel in novels:
        novel_id = novel["id"]
        old_url = novel["cover_url"]
        
        # Generate a clean filename based on novel ID or slug
        file_name = f"{novel_id}.jpg"

        try:
            print(f"Downloading cover for: {novel['title']}...")
            # 2. Download image from external URL
            img_response = requests.get(old_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
            
            if img_response.status_code != 200:
                print(f"Failed to download image for {novel['title']} (Status: {img_response.status_code})")
                continue

            image_data = img_response.content

            # 3. Upload image bytes to Supabase Storage bucket
            print(f"Uploading {file_name} to Supabase Storage...")
            supabase.storage.from_(BUCKET_NAME).upload(
                path=file_name,
                file=image_data,
                file_options={"content-type": "image/jpeg", "upsert": "true"}
            )

            # 4. Get the public URL of the newly uploaded image
            public_url_res = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
            # Depending on python client version, get_public_url might return a string or dict
            new_public_url = public_url_res if isinstance(public_url_res, str) else public_url_res.get("publicUrl")

            # 5. Update the novels table with the new Supabase URL
            supabase.table("novels").update({"cover_url": new_public_url}).eq("id", novel_id).execute()
            print(f"Successfully updated {novel['title']}!\n")

        except Exception as e:
            print(f"Error processing {novel['title']}: {e}\n")

if __name__ == "__main__":
    migrate_covers()