.PHONY: export rebuild

# Run the export script inside the backend container
export:
	docker-compose exec backend python app/scripts/export_with_idnex_to_csv.py

# Rebuild and start all services in detached mode
rebuild:
	docker-compose up --build -d
