---
sidebar_position: 1
---

# Introduction

Welcome to Group 1's implementation of the TODO app for CPS 730!
This is a comprehensive set of documentation that aims to bring new developers up to speed, along with giving a high-level overview of how our project works.

TODO
TODO
TODO

1. Talk about networking
2. Talk about the architecture within AWS
3. Talk about CI
4. Talk about deployment process
5. Talk about technical decisions

TODO
TODO
TODO

## Table of Contents

1. [Entities - The various entities that exist within the application](./Entities.md)
2. [Configuration - Environment variables to configure application behavior](./Configuration.md)
3. [Docker - The build images and the docker compose file](./Docker.md)
4. [Authentication - Google OAuth 2.0 login flow and session management](./Authentication.md)

## Motivation

This application aims to extend Docker's [getting started image](https://github.com/docker/getting-started) with additional features, including:

- Task Prioritization: Allowing users to set priorities to tasks
- Categories: Allowing users to create and assign tasks to categories
- Due Dates: Allowing tasks to have dedicated due dates
- Search and Filter: Allowing tasks to be searched through

In addition, the following concepts have also been leveraged to improve extensibility into the future:

- TypeScript support
- Monorepo approach to enable faster iterations with a small development team
- Shared types between the backend and frontend
- Automated unit tests via Jest and Vitest
- Docker containerization to support future development

## Starting the project locally

1. Clone the repository

```bash
git clone https://github.com/allanhechen/cps-730-labs.git
cd cps-730-labs
```

2. Install the dependencies

```bash
yarn
```

3. Build and run the Docker containers

```bash
docker compose up -d
```

4. Navigate to the frontend [here](http://localhost:8081)
