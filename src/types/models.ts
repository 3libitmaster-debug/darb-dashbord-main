/**
 * Global Consolidated Barrel File for Application Models
 * This file acts as a clean facade to re-export models that are individually separated.
 * Every model resides inside a dedicated file matching its single responsibility.
 */

export * from './api-response';
export * from './governorate';
export * from './city';
export * from './bank';
export * from './customer';
export * from './transport-company';
export * from './dashboard-stats';
export * from './company-registration';
export * from './pending-subscription';
export * from './advertisement';
export * from './trip-status';
export * from './trip';
export * from './complaint';
export * from './notification';

// Core component specific types re-exported for systemic backward compatibility
export * from './bus';
export * from './station';
export * from './trip-fare';
export * from './bank-account';
export * from './booking';
export * from './auth';
