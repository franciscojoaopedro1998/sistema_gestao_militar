import {
  mockPersonnel,
  mockWeapons,
  mockWeaponLoans,
  mockVehicles,
  mockMaintenanceLogs,
  mockBarracks,
  mockMissions,
  mockMilitares,
  mockHistoricoEventos,
  mockCourses
} from "./mock";

// Re-exporting stateful in-memory stores to be shared across modular routes
export let personnelStore = [...mockPersonnel];
export let weaponsStore = [...mockWeapons];
export let weaponLoansStore = [...mockWeaponLoans];
export let vehiclesStore = [...mockVehicles];
export let maintenanceLogsStore = [...mockMaintenanceLogs];
export let barracksStore = [...mockBarracks];
export let missionsStore = [...mockMissions];
export let militaresStore = [...mockMilitares];
export let historicoEventosStore = [...mockHistoricoEventos];
export let coursesStore = [...mockCourses];

// Helper functions to modify store in-memory from modular controllers
export function setPersonnelStore(newStore: any[]) {
  personnelStore = newStore;
}

export function setWeaponsStore(newStore: any[]) {
  weaponsStore = newStore;
}

export function setWeaponLoansStore(newStore: any[]) {
  weaponLoansStore = newStore;
}

export function setVehiclesStore(newStore: any[]) {
  vehiclesStore = newStore;
}

export function setMaintenanceLogsStore(newStore: any[]) {
  maintenanceLogsStore = newStore;
}

export function setBarracksStore(newStore: any[]) {
  barracksStore = newStore;
}

export function setMissionsStore(newStore: any[]) {
  missionsStore = newStore;
}

export function setMilitaresStore(newStore: any[]) {
  militaresStore = newStore;
}

export function setHistoricoEventosStore(newStore: any[]) {
  historicoEventosStore = newStore;
}

export function setCoursesStore(newStore: any[]) {
  coursesStore = newStore;
}
