import { useContext } from "react";
import { ReservationContext } from "../context/Context";
import AdminManageAllReservation from "./AdminManageAllReservation";
import AdminManageReservation from "./AdminManageReservation";

function AdminReservationUI() {
  const isPending = useContext(ReservationContext);
  return (
    <>
      {isPending ? <AdminManageAllReservation /> : <AdminManageReservation />}
    </>
  );
}

export default AdminReservationUI;
