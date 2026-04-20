Please answer in english and provide code in English.
We code in TypeScript and use Jest for testing our code.
When possible, please provide links and references for additional learning.

The backend code is using NestJS in TypeScript, Prisma as our ORM, and PostgreSQL as our database.
The frontend code is using VueJS in TypeScript with Vue Router and Vuex for state management.
We use Docker for containerization and deploy on Azure.
We use GitHub Actions for CI/CD.

This is our SQL database schema for Music Albums management:

    ```sql
    CREATE TABLE artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(2083),
        release_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
