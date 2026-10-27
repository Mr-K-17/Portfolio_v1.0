import pypdf
import json

reader = pypdf.PdfReader("resume/KISHORE S V_Resume.pdf")
print(f"Total Pages: {len(reader.pages)}")

full_text = ""
all_links = []

for idx, page in enumerate(reader.pages):
    print(f"\n--- PAGE {idx+1} ---")
    text = page.extract_text()
    full_text += f"\n--- PAGE {idx+1} ---\n" + text
    print(text)
    
    # Extract annotations / hyperlinks
    if "/Annots" in page:
        for annot in page["/Annots"]:
            obj = annot.get_object()
            if "/A" in obj and "/URI" in obj["/A"]:
                uri = obj["/A"]["/URI"]
                all_links.append(uri)
                print(f"Hyperlink found: {uri}")

with open("resume_extracted.json", "w", encoding="utf-8") as f:
    json.dump({
        "full_text": full_text,
        "links": list(set(all_links))
    }, f, indent=2)

print("\nSaved extracted text and links to resume_extracted.json")
