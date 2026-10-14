import type { BookingCreate } from "@deskaway/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postBooking } from "../../lib/api";

export function useCreateBooking(stayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (booking: BookingCreate) => postBooking(booking),
    // The confirmation page can show the booking without loading it again.
    onSuccess: (booking) => {
      queryClient.setQueryData(["booking", booking.id], booking);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quote", stayId] }),
        queryClient.invalidateQueries({ queryKey: ["availability", stayId] }),
      ]);
    },
    // E.g. after a 409 the summary should say the dates are taken.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["quote", stayId] }),
  });
}
