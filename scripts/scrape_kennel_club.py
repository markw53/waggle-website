# scripts/scrape_kennel_club.py
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json

def scrape_kennel_club_breeds():
    """
    Scrapes breed data from The Kennel Club website
    """
    url = "https://www.thekennelclub.org.uk/search/breeds-a-to-z/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    print("🔍 Fetching breed data from The Kennel Club...")
    time.sleep(1)  # Be respectful
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract breed cards
        breed_cards = soup.find_all("a", {"class": "m-breed-card__link"})
        
        print(f"✅ Found {len(breed_cards)} breed cards")
        
        breeds_data = []
        
        for card in breed_cards:
            try:
                # Extract basic info from card
                title_elem = card.find("strong", {"class": "m-breed-card__title"})
                category_elem = card.find("div", {"class": "m-breed-card__category"})
                image_elem = card.find("img", {"class": "a-media__image"})
                
                breed_name = title_elem.getText().strip() if title_elem else ""
                category = category_elem.getText().strip() if category_elem else ""
                image_url = image_elem.get('src') if image_elem else ""
                breed_link = card.get('href', '')
                
                if not breed_name:
                    continue
                
                # Visit breed detail page to get more info
                print(f"  📖 Scraping {breed_name}...")
                time.sleep(0.5)  # Rate limiting
                
                breed_details = scrape_breed_details(breed_link, headers)
                
                breed_data = {
                    'name': breed_name,
                    'category': category,
                    'imageUrl': image_url,
                    'officialLink': f"https://www.thekennelclub.org.uk{breed_link}" if breed_link else "",
                    **breed_details
                }
                
                breeds_data.append(breed_data)
                print(f"    ✅ {breed_name} complete")
                
            except Exception as e:
                print(f"    ❌ Error processing breed card: {e}")
                continue
        
        return breeds_data
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return []

def scrape_breed_details(breed_path, headers):
    """
    Scrapes detailed information from a breed's page
    """
    details = {
        'size': '',
        'lifespan': '',
        'exercise_needs': '',
        'grooming': '',
        'temperament': '',
        'good_with_children': '',
        'kennel_club_group': ''
    }
    
    if not breed_path:
        return details
    
    try:
        full_url = f"https://www.thekennelclub.org.uk{breed_path}"
        response = requests.get(full_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract breed summary details
        summary_items = soup.find_all("dd", {"class": "m-breed-summary__value"})
        summary_labels = soup.find_all("span", {"class": "m-breed-summary__key-label"})
        
        for label, value in zip(summary_labels, summary_items):
            label_text = label.getText().strip().lower()
            value_text = value.getText().strip()
            
            if 'size' in label_text:
                details['size'] = value_text
            elif 'lifespan' in label_text or 'life' in label_text:
                details['lifespan'] = value_text
            elif 'exercise' in label_text:
                details['exercise_needs'] = value_text
            elif 'grooming' in label_text:
                details['grooming'] = value_text
            elif 'temperament' in label_text:
                details['temperament'] = value_text
            elif 'children' in label_text:
                details['good_with_children'] = value_text
        
        # Extract Kennel Club group
        group_elem = soup.find("div", {"class": "m-breed-header__group"})
        if group_elem:
            details['kennel_club_group'] = group_elem.getText().strip()
        
    except Exception as e:
        print(f"    ⚠️ Error fetching breed details: {e}")
    
    return details

def map_to_firebase_format(kennel_data):
    """
    Maps Kennel Club data to Firebase format with sensible defaults
    """
    
    # Map Kennel Club categories to your existing types
    category_mapping = {
        'Gundog': 'Sporting',
        'Hound': 'Hound',
        'Pastoral': 'Herding',
        'Terrier': 'Terrier',
        'Toy': 'Toy',
        'Utility': 'Non-Sporting',
        'Working': 'Working'
    }
    
    # Map size to height/weight estimates
    size_mapping = {
        'Small': {'height': '25-35 cm', 'weight': '5-10 kg'},
        'Medium': {'height': '35-50 cm', 'weight': '10-25 kg'},
        'Large': {'height': '50-65 cm', 'weight': '25-40 kg'},
        'Giant': {'height': '65+ cm', 'weight': '40+ kg'}
    }
    
    firebase_data = []
    
    for i, breed in enumerate(kennel_data):
        # Determine size measurements
        size_info = size_mapping.get(breed.get('size', 'Medium'), size_mapping['Medium'])
        
        # Map category to type
        breed_type = category_mapping.get(breed.get('kennel_club_group', ''), 'Non-Sporting')
        
        # Parse lifespan
        lifespan = breed.get('lifespan', '10-14 years')
        
        firebase_breed = {
            'name': breed['name'],
            'type': breed_type,
            'height': size_info['height'],
            'weight': size_info['weight'],
            'color': 'Various',  # Not available from Kennel Club
            'popularity': i + 1,  # Use index as popularity rank
            'intelligence': 50,  # Default - you can update manually or from another source
            'longevity': lifespan,
            'healthProblems': 'Varies by breed - consult veterinarian',
            'yearlyExpenses': 1500,  # Default estimate
            'mealsPerDay': 2,
            'avgPuppyPrice': 1000,  # Default estimate
            'imageUrl': breed['imageUrl'],
            'officialLink': breed['officialLink'],
            'kennelClubCategory': breed.get('kennel_club_group', ''),
            'size': breed.get('size', 'Medium'),
            'exerciseNeeds': breed.get('exercise_needs', ''),
            'grooming': breed.get('grooming', ''),
            'temperament': breed.get('temperament', ''),
            'goodWithChildren': breed.get('good_with_children', ''),
        }
        
        firebase_data.append(firebase_breed)
    
    return firebase_data

def main():
    print("🐕 Kennel Club Breed Scraper")
    print("=" * 50)
    
    # Scrape data
    kennel_data = scrape_kennel_club_breeds()
    
    if not kennel_data:
        print("❌ No data scraped. Exiting.")
        return
    
    print(f"\n✅ Successfully scraped {len(kennel_data)} breeds")
    
    # Map to Firebase format
    print("\n📝 Mapping to Firebase format...")
    firebase_data = map_to_firebase_format(kennel_data)
    
    # Save to CSV
    df = pd.DataFrame(firebase_data)
    csv_filename = 'kennel_club_breeds.csv'
    df.to_csv(csv_filename, encoding='utf-8-sig', index=False)
    print(f"✅ Saved to {csv_filename}")
    
    # Save to JSON for easier import
    json_filename = 'kennel_club_breeds.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(firebase_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved to {json_filename}")
    
    # Print summary
    print("\n📊 Summary:")
    print(f"   Total breeds: {len(firebase_data)}")
    print(f"   Breeds with images: {sum(1 for b in firebase_data if b['imageUrl'])}")
    print(f"   Breed types: {len(set(b['type'] for b in firebase_data))}")
    
    # Print type distribution
    print("\n📈 Breed Type Distribution:")
    type_counts = {}
    for breed in firebase_data:
        breed_type = breed['type']
        type_counts[breed_type] = type_counts.get(breed_type, 0) + 1
    
    for breed_type, count in sorted(type_counts.items()):
        print(f"   {breed_type}: {count}")
    
    print("\n🎉 Done! You can now import this data to Firebase.")
    print(f"   Run: npm run import-breeds")

if __name__ == "__main__":
    main()