### Table: `humanitarian_aid`

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| financial_year | VARCHAR(20) | Financial year (অর্থবছর) |
| name | VARCHAR(255) | Applicant name |
| father_name | VARCHAR(255) | Father's name |
| mother_name | VARCHAR(255) | Mother's name |
| nid_birth_reg_no | VARCHAR(50) | NID / Birth registration number |
| profession | VARCHAR(255) | Profession |
| relation_to_beneficiary | VARCHAR(100) | Relation to beneficiary |
| address | TEXT | Full address |
| upazila | VARCHAR(100) | Sub-district |
| zila | VARCHAR(100) | District, default: কুষ্টিয়া |
| mobile | VARCHAR(20) | Mobile number |
| category | VARCHAR(100) | Aid category |
| amount_eng | DECIMAL(10,2) | Amount in numeric format |
| bank | VARCHAR(255) | Bank name |
| check_no | VARCHAR(50) | Check number |
| check_date | VARCHAR(50) | Check date |
| reference | VARCHAR(255) | Reference |
| application_details | TEXT | Application details |
| status | VARCHAR(50) | Payment status, default: Delivered |

**Indexes:** name, father_name, mother_name, nid, mobile, address, financial_year, upazila, category

### Humanitarian Aid Categories

| Category | Description |
|----------|-------------|
| দরিদ্র শিক্ষার্থীর জন্য শিক্ষা সহায়তা | Education aid for poor students |
| অসুস্থ ব্যক্তির জন্য চিকিৎসা সহায়তা | Medical aid for sick persons |
| দুর্ঘটনায় আহত ব্যক্তির জন্য মানবিক সহায়তা | Aid for accident victims |
| প্রতিবন্ধী ব্যক্তির জন্য মানবিক সহায়তা | Aid for disabled persons |
| প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্থ মানবিক সহায়তা | Aid for natural disaster victims |
| দরিদ্র ও অসহায় ব্যক্তির জন্য মানবিক সহায়তা | Aid for poor and helpless persons |
| জুলাই যোদ্ধার জন্য মানবিক সহায়তা | Aid for July fighters |
| বীর মুক্তিযোদ্ধার জন্য মানবিক সহায়তা | Aid for freedom fighters |
| জেলা পরিষদ কর্মচারী কল্যাণ | Aid for staffs of zilla parishad |
---

## Data Scraping Rules Summary:

### 1. **Categories**
   - Follow humanitarian aid categories from README.md
   - Every entry must fall into one category
   - Categories include: জুলাই যোদ্ধার জন্য মানবিক সহায়তা, অসুস্থ ব্যক্তির জন্য চিকিৎসা সহায়তা, দরিদ্র শিক্ষার্থীর জন্য শিক্ষা সহায়তা, দরিদ্র ও অসহায় ব্যক্তির জন্য মানবিক সহায়তা, etc.

### 2. **Relation to Beneficiary**
   - Should be "নিজ" (self) or পিতা/মাতা/অভিভাবক (father/mother/guardian) accordingly

### 3. **Reference Field**
   - Capture who recommended the aid

### 4. **Application Details**
   - Make it one or two complete Bangla sentences
   - Do NOT drop any information
   - Add details from other fields if needed
   - Make it as long as possible but concise
   - If any info doesn't fit other columns, it goes here

### 5. **Address Field**
   - Add upazila and zilla if missing
   - Get data from upazila and zila columns

### 6. **Mobile Number**
   - Must be exactly 11 digits
   - Must start with 0
   - No other characters (no hyphens, spaces, etc.)

### 7. **Data Extraction**
   - Get as much information as possible from the PDF
   - Do not drop any information
   - Extract all available data even if it doesn't perfectly fit the schema

### 8. financial year format like 2024-25, 2025-26 etc 

### 9. the value for 'nid_birth_reg_no' column field is digit.

### 10. if the check date is after 30/06/2025, make financial year 2025-26


The CSV file I created follows all these rules with properly categorized entries, formatted mobile numbers, complete addresses with upazila/zilla, and comprehensive Bangla application details.
