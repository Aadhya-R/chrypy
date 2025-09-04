from main import Base, engine

def run_migrations():
    print("Running database migrations...")
    try:
        # This will create all tables that don't exist yet
        Base.metadata.create_all(bind=engine)
        print("Database migrations completed successfully!")
    except Exception as e:
        print(f"Error running migrations: {e}")
        raise

if __name__ == "__main__":
    run_migrations()
