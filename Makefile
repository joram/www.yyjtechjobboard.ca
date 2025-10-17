# YYJ Tech Job Board Makefile

# Variables
SHEETS_URL := https://docs.google.com/spreadsheets/d/1gZz10BGTJqU1_SFCGU7g-6pp1XGkueYYEK9KHC8Hf8U/export?format=csv&gid=11398825
CSV_FILE := public/job_data.csv
JSON_FILE := public/job_data.json
S3_BUCKET := yyjtechjobboard.ca
CLOUDFRONT_DISTRIBUTION := EP3UB04VUQG2S

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  update_data  - Download job data from Google Sheets and convert to JSON"
	@echo "  check_urls   - Check job posting URLs and remove dead links"
	@echo "  install      - Install npm dependencies"
	@echo "  start        - Start development server"
	@echo "  build        - Build for production"
	@echo "  deploy       - Build and deploy to S3 with CloudFront invalidation"
	@echo "  clean        - Remove generated files"

# Download job data from Google Sheets and convert to JSON
.PHONY: update_data
update_data:
	@echo "Downloading job data from Google Sheets..."
	@curl -L -o $(CSV_FILE) "$(SHEETS_URL)"
	@echo "Converting CSV to JSON format..."
	@python3 scripts/csv_to_json.py
	@echo "Job data converted to $(JSON_FILE)"

# Check job posting URLs and remove dead links
.PHONY: check_urls
check_urls:
	@echo "Checking job posting URLs for dead links..."
	@echo "Creating backup of original data..."
	@cp $(CSV_FILE) $(CSV_FILE).backup
	@python3 scripts/check_urls.py $(CSV_FILE)
	@echo "URL checking complete!"
	@echo "Original data backed up to: $(CSV_FILE).backup"

# Install dependencies
.PHONY: install
install:
	npm install

# Start development server
.PHONY: start
start:
	npm start

# Build for production
.PHONY: build
build:
	npm run build

# Deploy to S3 with CloudFront invalidation
.PHONY: deploy
deploy:
	@echo "Building application..."
	@npm run build
	@echo "Syncing to S3 bucket: $(S3_BUCKET)"
	@aws s3 sync build/ s3://$(S3_BUCKET)/ --delete --profile personal
	@echo "Invalidating CloudFront distribution: $(CLOUDFRONT_DISTRIBUTION)"
	@aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_DISTRIBUTION) --paths "/*" --profile personal
	@echo "Deployment complete!"

# Clean generated files
.PHONY: clean
clean:
	rm -rf build/
	rm -f $(CSV_FILE) $(JSON_FILE)
