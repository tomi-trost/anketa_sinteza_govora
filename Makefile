.PHONY: export rebuild

# Run the export script inside the backend container
export:
	docker-compose exec backend python app/scripts/export_with_index_to_csv.py

# Simulate the responses of users
simulate:
	cd backend && poetry run python app/scripts/simulate_full_users.py

# Moves exported files to the host filesystem
move-exports:
	cp -r ./backend/exports/ /mnt/c/Users/tomit/Desktop/exports/


# Rebuild and start all services in detached mode
rebuild:
	docker-compose up --build -d

# Remove the running services
clean:
	docker-compose down
