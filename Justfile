port := "8080"

# List available recipes
default:
    @just --list

# Free the port, then run the site with hot reload; shows drafts and future-dated posts
serve:
    -pids=$(lsof -ti tcp:{{port}} -sTCP:LISTEN); [ -n "$pids" ] && kill -9 $pids
    ASPNETCORE_ENVIRONMENT=Development dotnet watch run --urls http://localhost:{{port}}

# Run the site as production would (hides drafts and future-dated posts)
serve-prod:
    ASPNETCORE_ENVIRONMENT=Production dotnet run --urls http://localhost:{{port}}

# Prerender the static site into dist/ (same as CI)
build:
    dotnet run -- --AppTasks=prerender

# Build and serve the prerendered dist/ output
preview: build
    python3 -m http.server {{port}} --directory dist

# Remove build output
clean:
    rm -rf dist bin obj
