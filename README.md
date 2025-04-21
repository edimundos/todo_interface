# Todo Interface - Report and Setup Instructions

A lot of AI was used for building front end as this is my first TS/React project. I focused more on setting everything up, my cloudflared tunnels, libraries, features and so on...

## Project Overview

This project is a **Todo Management Interface** that I developed and hosted on [todo.zeiris.id.lv](https://todo.zeiris.id.lv). It is a web-based application that allows users to manage their tasks efficiently. The application includes features such as user authentication, task creation, editing, deletion, filtering, and sorting. The project was built using modern web technologies and libraries to ensure a responsive and user-friendly experience.

NOTE - the UI is bugged right now, but i focused on making all the features and hosting the solution

I also chose to access the api from a public endpoin for the point of learning

---

## Project Setup and Hosting

### How the Project Was Generated

The project was initially scaffolded using **Vite**, a fast build tool for modern web applications. The following technologies and tools were used during development:

- **React**: For building the user interface.
- **TypeScript**: For type safety and better development experience.
- **Tailwind CSS**: For styling and utility-first CSS.
- **Radix UI**: For accessible and customizable UI components.
- **Framer Motion**: For animations and transitions.
- **Sonner**: For toast notifications.
- **Lucide Icons**: For modern and customizable icons.

### Hosting

The application is hosted on my personal domain: [todo.zeiris.id.lv](https://todo.zeiris.id.lv). It is containerized using Docker and can be run locally or deployed to any Docker-compatible environment.

---

## Features Implemented

### Authentication
- **Login**: Users can log in using their credentials.
- **Registration**: New users can register with a username and password.
- **Protected Routes**: Certain pages are accessible only to authenticated users.

### Task Management
- **Create Tasks**: Users can create tasks with a title, description, due date, priority, and status.
- **Edit Tasks**: Tasks can be updated with new details.
- **Delete Tasks**: Users can delete tasks they no longer need.
- **Toggle Task Status**: Tasks can be marked as completed or incomplete.

### Filtering and Sorting
- **Search**: Users can search for tasks by title or description.
- **Sort**: Tasks can be sorted by due date, priority, or title.
- **Tabs**: Tasks are categorized into "All", "Active", and "Completed" tabs.

### UI and UX Enhancements
- **Responsive Design**: The application is fully responsive and works on all screen sizes.
- **Animations**: Smooth animations for transitions and interactions using Framer Motion.
- **Tooltips**: Tooltips for better user guidance.
- **Badges**: Visual indicators for task priority, status, and due dates.
- **Skeleton Loading**: Placeholder loading animations while data is being fetched.

---

## Libraries and Components Used

### Libraries
- **React**: Core library for building the UI.
- **React Router DOM**: For routing and navigation.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible UI primitives.
- **Framer Motion**: For animations.
- **Sonner**: For toast notifications.
- **Lucide React**: Icon library.
- **clsx**: Utility for conditional class names.
- **tailwind-merge**: For merging Tailwind CSS classes.

### Components
- **Input**: Custom input fields.
- **Button**: Styled buttons with variants.
- **Card**: For displaying tasks and forms.
- **Dialog**: Modal dialogs for creating and editing tasks.
- **Dropdown Menu**: Context menus for task actions.
- **Tooltip**: Hover tooltips for better UX.
- **Tabs**: Categorization of tasks.
- **Skeleton**: Loading placeholders.
- **Badge**: Visual indicators for task attributes.

---

## Running the Project with Docker

### Prerequisites
- Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone ...
   cd todo-interface/todo-ui
   ```

2. Build and run the Docker container:
   ```bash
   docker-compose up --build
   ```

3. Access the application in your browser at:
   ```
   http://localhost:5173
   ```

### Docker Compose Configuration
The `docker-compose.yml` file is configured to:
- Build the application using the `Dockerfile`.
- Expose the application on port `5173`.
- Mount the project directory for live updates during development.

---
