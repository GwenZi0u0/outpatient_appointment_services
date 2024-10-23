# outpatient_appointment Project

outpatient_appointment_services

User Doctor : [Project Link](https://outpatient-appointment.web.app/login)

User Patient : [Project Link](https://outpatient-appointment.web.app/)

## Introduction

> Objective

- Create an online appointment booking website.
- The expected difference from others on the market is to streamline the appointment scheduling process.

> User

- Doctor, Nurse
- Patient

> Pain points of online registration pages on the market:

- Font is too small, and operation buttons are unclear.
- The online registration system can be made clearer, with easy-to-understand buttons and a user-friendly interface.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

## Getting Started

this project is a simple application built with React, Vite, Zustand, styled-components, useQuery, and useForm. It serves as a starting point for building modern web applications with these technologies.

## Installation

Follow these steps to get the project up and running on your local machine:

1. **Install packages:**

   Make sure you have Node.js and yarn installed.

   ```bash
   yarn install
   ```

## Running the Project

To run the project locally:

```bash
yarn dev
```

Run prod site mode

```bash
yarn build
```

## Project Structure

The detailed structural information of this project has been moved to the [dedicated document](./PROJECT_STRUCTURE.md).

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) A JavaScript library for building user interfaces.

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) A fast development build tool for modern web projects.

**State Management**

![Zustand](https://img.shields.io/badge/zustand-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) A small, fast state management solution using hooks.

**Data Fetching**

![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)(@tanstack/react-query) An opinionated, efficient library for managing server state and handling data fetching or updating.

**Form Handling**

![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white) A hook for managing and handling form state, simplifying input validation and submission.

**API Integration**

![ChatGPT](https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white) An API from OpenAI that can talk like a human. It helps apps have smart conversations or answer questions automatically.

**Styling**

![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white) A library for styling React components using tagged template literals.

### Features

- Modular and scalable structure.
- Simple yet powerful state management using Zustand.
- Responsive and reusable components styled with styled-components.
- Data fetching and caching through useQuery, ensuring efficient server communication.
- Easy form handling and validation using useForm.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
