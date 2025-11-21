---
title: NPHIES Integration Overview
description: Learn about Saudi Arabia's National Platform for Health Information Exchange (NPHIES) and how to integrate using FHIR R4 standards for claims and eligibility.
---

# NPHIES Overview

NPHIES (National Platform for Health and Insurance Exchange Services) is the national platform enabling:

- Claim exchange
- Eligibility checks
- e-Authorizations
- Payment reconciliation

It uses **FHIR R4** as the base standard.

## Required Profiles

- Claim
- Coverage
- ExplanationOfBenefit
- Encounter
- Observation
- Procedure

## FHIR Validation

A single failed field can reject the entire claim.
