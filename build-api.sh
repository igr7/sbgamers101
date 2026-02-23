#!/bin/bash
cd api
npm install
npx prisma generate
npx next build
