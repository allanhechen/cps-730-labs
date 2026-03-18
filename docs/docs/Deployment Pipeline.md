---
sidebar_position: 8
---

# Deployment Pipeline Documentation

## Technologies used:
### Infrastructure & Networking:
- AWS EC2 (Ubuntu): The virtual cloud server hosting the application. We chose EC2 over Lightsail because EC2 provided us with more control over network settings (including security groups).
- AWS Elastic IP: Provides the application with a static/public/usable address (IPv4) to retain the server’s identity between restarts.
- DuckDNS: A DNS service used to route a custom domain name to the AWS elastic IP

### Containerization & Web Serving:
- Docker & Docker Compose: This enables us to contain all components of the application in a container, allowing for consistency between environments as well as isolating front-end (UI) from back-end (API/Server) & reverse proxy (NGINX) elements. All elements can be easily managed through the use of containers.
- NGINX: Serves as the reverse proxy and load balancer. Listens on port 8080 and actively directs traffic by sending API and Auth requests to the Node.js back-end while serving the React UI to the front end.

### Application Stack:
Frontend: React
Backend: Node.js / Express
Database: SQLite
Authentication: Google OAuth

## How the Automated Pipeline is Set Up
This illustrates how information flows between a developer's personal computer and an active web server hosted on AWS.
1. Trigger: When a developer makes a code change, that change is saved as part of the main branch on GitHub, which automatically initiates a series of GitHub Actions based on workflows written in YAML format.
2. Runner: Each time a code change is committed, it also triggers an automatic workflow per the defined workflow in the repository, which is then executed by the GitHub Action runner.
3. Secure Connection: GitHub Action runners authenticate with and log into an Amazon EC2 instance using an SSH key that is securely stored within GitHub Secrets.
4. Environment Injection: Once the pipeline retrieves the most recent repository contents and updates the server, the pipeline then creates an .env file securely with sensitive information (e.g., Google Client ID, Client Secret, Session Keys) injected as environment variables directly from GitHub Secrets so they never appear as plain-text in the repository.
5. Container Rebuild: Once all of the above actions are completed, the pipeline will issue the docker compose down command to stop the currently running environment and then issue the docker compose up -d --build command to build and start the updated application with new code compiled into new container images


## How Involved GitHub Is
Github not only plays an important role as a repository but also as the nerve center of our entire deployment. GitHub supports our involvement with the project through three key pillars:
- The Single Source of Truth (Version Control): GitHub serves as the common code repository for the entire team and is where all team members submit their work products. If a file is not in GitHub, it will not go into production.
- The Automation Engine (CI/CD): GitHub is the execution engine for all deployment commands via GitHub Actions. It replaces the need to utilize AWS CodeDeploy/CodePipeline since it builds and deploys all projects internally.
- The Security Vault (Secrets Management): GitHub contains all of our most sensitive security credentials. Using GitHub Secrets, we can securely use AWS SSH keys and Google OAuth credentials, allowing us to keep sensitive information out of public configuration files.


