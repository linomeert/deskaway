import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../../lib/api";

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
  });
}
