# Just Insure - Backend Interview

## Description

This is an example project that can be used for interview tasks for Just Insure.

It describes a Trip which:

1.  Receives trips generated from our app via GCP PubSub
2.  Stores the trip information in Postgres
3.  Calls out to a Balance service (fictiously) to drill down on their account balance for miles driven
4.  Sends user a notification to app (fictiously) with the trip summary
5.  Provides a HTTP endpoint for requesting trip information (functional)

## Installation

1. Clone this project
2. Install dependencies: `yarn`
3. Production run `yarn start` or as developer `yarn start:dev`

## Interview Task

You'll be sent an interview task that uses this as a basis.
