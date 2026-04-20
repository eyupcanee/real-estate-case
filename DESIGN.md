# Estate Case Study

## Project Overview

The Estate Case Study is a full-stack dashboard designed for real estate agencies to efficiently manage properties, agents, and sales/rental transactions. It automates complex business processes, including stage tracking and post-transaction commission distributions.

## Tech Stack

### Backend

- NestJS
- Mongoose
- Validation Pipe
- Swagger
- Jest

### Database

- MongoDB Atlas

### Frontend

- Nuxt3
- Pinia
- TailwindCSS
- Lucide Icons

## Backend Architecture & Business Logic

### Data Table Modelling

- The database consists of 4 main collections: agents, properties, transactions, and audit-logs.

#### Agent Table Structure

- Due to the project being a case study and time constraints, the agents table was created with only email and fullname fields.
- In the real world, with the addition of authentication and authorization to the agents table, fields such as username, password, address, phoneNumber, refreshToken, role, etc., also need to be added.

#### Properties Table Structure

- Since the main focus of the case study is transaction management, this table has also been kept simple, including title, location, price, and type (RESIDENTIAL, COMMERCIAL, LAND).
- In the real world, many different fields such as a property's facade, number of rooms and living rooms, floor, and square meters must also be kept in this table.

#### Audit-Logs Table Structure

- As per the traceability required in the case study, it is a table that clearly records the operations performed and is protected by a hash chain to ensure non-repudiation and to guarantee that logs are not altered even at the database level.
- The table includes entityType, entityId, action, payload, previousHash, currentHash, and timestamp fields.
- In the real world, details up to who performed these operations, when, with which IP and role must be kept in this table.
- Hash chain: It is the process of hashing each log's own data combined with the data of the previous log using the SHA-256 algorithm and storing it in the currentHash field. At the same time, it keeps the hash of the previous log in its own previousHash field. This causes the chain to break if even a single letter in any log is changed, even at the database level. This ensures the non-repudiation of the records.

#### Transactions Table Structure

- The transaction table is the table where operations are recorded, containing propertyID, stage, totalServiceFee, listingAgentID, sellingAgentId, type, and financialBreakdown.
- The financial breakdown, meaning the agency share, and the selling and listing agent shares, are kept embedded.
- Reasons for preferring embedded:
  - NoSQL: If I were working on a SQL database, as per data normalization rules, I would keep the financial data obtained as a result of the transaction in a separate table and construct it within a one-to-one relationship. However, thanks to denormalization, which is the advantage of Document-based NoSQL, it allows me to obtain this data without dealing with the cost of joins per request, without keeping it as a separate table. If, in the future, commission transfers to agents independent of the transaction become an issue, it might seem logical to keep a separate table, but even in its current state, with the speed advantage of NoSQL, performing this operation on a table where the stage field is indexed is fast enough. Therefore, the extra code overhead and cost were avoided.
  - Single-time operation: The financial breakdown is calculated and written only once when a transaction moves to the completed stage. It cannot be updated or subjected to another operation later. The reason we write it inside is actually the same. If this were a digital wallet or a similar project, it could be calculated at the time of the transaction, similar to event-sourcing, and shown to the user. However, specific to this study, an event-sourcing-like approach was deemed unnecessary due to the extra processing cost and speed loss in every request, the cron and caching that would be necessary to tolerate this loss, and the data synchronization issues that could still be experienced despite this.

### Backend Structure

#### Backend Architecture

- Architecturally, a modular monolith approach was preferred within the scope of this case. The code is already written module-based. For some cross-checks, the schemas of other agent and property modules were imported into the transaction side. However, these schemas can quickly be moved to a shared kernel to achieve a complete modular monolith. At the same time, each module can easily be stood up as separate services, and a transition to a microservice architecture can be made with a message bus if needed. Considering the time and scope of this project, a modular monolith was found to be logical.

#### Data Validation & Backend Normalization

- In real-world projects, highly trackable workflows with strict rules, like transactions, are designed with business rules directly embedded in the entity (in our project, the schema) along with rich model entities like DDD. However, in our project, the business rules of the transaction at hand can be satisfied without needing a relatively complex architecture like DDD. Meeting this by placing constraints based on the simpler Validation Pipe and Schema was found to be better to reduce extra maintenance costs and the possibility of leaving technical debt, and to avoid over-engineering within the time and scope of the project.
- For validation, the first layer is the globally defined validation pipe used on DTOs. The second stage is provided together with decorators defined on mongoose schemas.

- Especially in teamworks, to ease the workflow and increase code quality and readability, the values returned from backend APIs need to conform to a specific schema. For this, by using a global interceptor, every request returning from the backend is ensured to conform to a specific schema:

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

- Just as successful results are returned, unsuccessful and erroneous results must also be returned within the same normalized schema. A global exception filter was used for this.

- In addition to these, swagger documentation, which is especially important for frontend developers, was also added.

#### Server Side Pagination & Filtering

- All listing endpoints in the system (Properties, Agents, Transactions) are designed to support Server Side Pagination and Regex-based Server Side Search by default.
- Due to the project scope and time constraint, it was designed with mongoose queries. When the number of users in the system increases and traffic rises, powerful search engines like Elastic Search can be used.
- Although pulling all the data to the frontend and filtering it client-side works for small data sets, it becomes unsustainable in terms of both network load and memory usage as the number of records increases. For this reason, pagination and filtering are done at the database level.

#### Transaction & Business Logic

- A sequential system is used for the stage we keep on the transaction side. When a transaction is in a certain stage, it can only transition to the allowed stage. Apart from this, in all stages except for 'completed' transactions, the transaction can only additionally be cancelled.
- Reasons for designing this as a one-way flow:
  - Preventing Mistakes: Blocking stage transitions in the codebase that might contradict the business logic for interface users.
  - Predictability: Having the stages follow each other clearly makes it understandable for both the user and the person reviewing reports generated from the interface in the future, ensuring the next step is clear.
  - Traceability: To be able to retroactively track when stages transitioned from which step to where, and to easily identify wrong steps or faulty operations.

- While designing the transaction flow, the double-selling problem was also prevented. The system is designed not to allow a new transaction to be created on the same property if there is already a transaction record on a property and this record is not 'completed' or 'cancelled'.

- The calculation of commissions in the transaction is calculated only while transitioning the transaction stage to 'completed' and is written embedded inside. This field cannot be changed or deleted later.

#### Commission Rules

- 50% of the total service fee always belongs to the agency.
- The remaining 50% is distributed to the agents according to the following rule:

| Scenario   | Condition       | Listing Agent | Selling Agent |
| ---------- | --------------- | ------------- | ------------- |
| Scenario 1 | Same agent      | %50           | —             |
| Scenario 2 | Different agent | %25           | %25           |

#### Testing

- Unit tests were written on the backend side to verify business logic, commission calculations, and state transitions. Jest was used as the testing framework.
- While writing the tests, the isolation principle was adhered to; Mongoose models and repositories were mocked to eliminate database dependency and ensure the tests run fast. Focus was solely on the business logic of the Service layer.

#### Rate Limiting & Cors

- Since it's a case study, I didn't put a rate limit on the API and left CORS in its default "all" state.
- In real-world projects, CORS should only be bound to the relevant domain, and there should be a rate limit for the API.

### Future Improvements & Good To Haves

#### Central Logging

- With a centralized log collection tool like Seq or similar, important operations in the system can be continuously monitored, and a report can be passed to the responsible software team.

#### Observability

- With tools like Grafana, Prometheus, Jaeger, metrics such as backend load, hardware load of the hosted machine, instantaneous number of requests, etc., can be tracked, and necessary developments can be applied in this context.

#### Containerization

- Using virtualization tools like Docker, team development speed and version compatibility can be ensured.

#### RBAC

- A role-based access system can be added so that agents, the company owner, and editors can all perform work over a single panel.

### Backend Conclusion

- In summary, the backend was developed with technologies and architectural decisions deemed appropriate within the project and time scope. In this context, decisions were taken that yield high value despite a light development and maintenance burden. Technical decisions and developments that could be unnecessary and over-engineering were avoided as much as possible.

## Frontend Architecture

### Components & UI/UX

- While writing components on the frontend side, care was taken to make them as reusable and technically 'dumb' as possible. This way, components like DataTable, Modal, etc., were not rewritten over and over.

- To make the components look as modern and premium as possible, colors that are easy to read, with high contrast and color harmony were chosen. At the same time, to familiarize the user with the interface and reduce cognitive load, the pages were designed in similar schemas, and icons were heavily featured.

- To facilitate the user's work in the search bar, a debounce mechanism was used instead of an external 'search' button.

- While the results of the operations performed by the user are shown instantaneously on the interface, an external toast message library was used to support this feeling.

- In order not to overwhelm the user, attention was paid to the margins between components and the padding inside components, and the screen was used widely.

- Although dashboard screens are used on desktop systems, the user who has work from mobile was also considered, and responsive design was made by taking advantage of the flexibility provided by TailwindCSS.

- To reduce the users' cognitive load, UI friction, and learning curve, the dashboard was prepared within the familiar trio of side menu, top menu, and content, rather than an innovative design.

### State Management

- Instead of constantly fetching the data coming from the API on every page, it was kept on the Pinia store. The store structure was built to work in harmony with the pagination architecture in the backend, preventing unnecessary API requests.
- Pinia stores are separated based on domain: useTransactionsStore, useAgentsStore, usePropertiesStore. Each store manages its own domain data, loading, and error states.
- In this way, unnecessary fetching of properties and agents data, which are also needed on the transaction page, is prevented.

### Error Handling

- The messages of the API requests I wrote inside the stores were directly extracted and presented to the user as toast messages. Thus, there was no need to write a try-catch block for every single request. In another project, detailed error handling based on HTTP codes might have been needed, but it was not deemed necessary within the time and scope of this project.

### Hosting

- Since I do not currently have a VPS/VDS server, hosting services with free tiers were preferred. The backend was hosted on Render, and the frontend on Vercel.

### NOTE

- Render automatically goes into sleep mode when the service is not used on the free tier. If the data does not arrive while testing the interface, wait 40-50 seconds.
