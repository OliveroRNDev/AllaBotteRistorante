import axios from "axios";
import { BACKEND_URL } from "./secret-variables";

export async function storeData(data) {
  axios.post(BACKEND_URL + "/data.json", data);
}

export function storeUser(data, id) {
  axios.put(BACKEND_URL + "/user/" + id + ".json", data);
}

export async function storeReservation(uid, data) {
  await axios.post(BACKEND_URL + "/reservation/" + uid + ".json", data);
}

export async function storeCartOrder(uid, data) {
  await axios.post(BACKEND_URL + "/cart_order/" + uid + ".json", data);
}

export async function updateCartOrder(uid, data, id) {
  await axios.put(
    BACKEND_URL + "/cart_order/" + uid + "/" + id + ".json",
    data
  );
}

export async function updateReservation(uid, id, data) {
  await axios.put(
    BACKEND_URL + "/reservation/" + uid + "/" + id + ".json",
    data
  );
}
export async function addPrinter(data) {
  await axios.post(BACKEND_URL + "/printers.json", data);
}

export async function addiOSPrinter(id, data) {
  await axios.post(BACKEND_URL + "/user/" + id + ".json", data);
}

export async function updatePrinter(id, data) {
  await axios.put(BACKEND_URL + "/printers/" + id + ".json", data);
}

export async function updateiOSPrinter(id, data) {
  await axios.put(BACKEND_URL + "/user/" + id + ".json", data);
}

export async function deleteReservation(uid, id) {
  await axios.delete(BACKEND_URL + "/reservation/" + uid + "/" + id + ".json");
}

export async function deleteTable(id) {
  await axios.delete(BACKEND_URL + "/order/" + id + ".json");
  await axios.delete(BACKEND_URL + "/tables/" + id + ".json");
}

export async function deleteAccount(id) {
  //delete orders
  await axios.delete(BACKEND_URL + "/cart_order/" + id + ".json");
  //delete reservations
  await axios.delete(BACKEND_URL + "/reservation/" + id + ".json");
}

export async function storeSensitiveUser(data) {
  const response = await axios.post(BACKEND_URL + "/userSensitive.json", data);
  return response.data.name;
}

export function updateUserData(data, dataSensitive, id) {
  axios.put(BACKEND_URL + "/user/" + id + ".json", data);
  axios.put(BACKEND_URL + "/userSensitive/" + id + ".json", dataSensitive);
}

export function updateUserTokenData(data, id) {
  axios.put(BACKEND_URL + "/user/" + id + ".json", data);
}

export function storeTable(data) {
  axios.post(BACKEND_URL + "/tables.json", data);
}

export function storeOrder(data, id) {
  axios.put(BACKEND_URL + "/order/" + id + ".json", data);
}
