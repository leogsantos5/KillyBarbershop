import { Barber, BookingSlotVM, DbBookedSlot } from "../types/booking";

export function updateAllSlotsAvailability(allSlots: BookingSlotVM[], bookingsBySlot: Map<number, DbBookedSlot[]>,
                                           allBarbers: Barber[], selectedBarber?: Barber | null): BookingSlotVM[] {

    // This function updates the status of each slot based on the availability of barbers
    const allUpdatedSlots: BookingSlotVM[] = [];

    for (const slot of allSlots) {
        const timestampKey = slot.Start.getTime();
        const bookingsForSlot = bookingsBySlot.get(timestampKey) || [];
        let updatedStatus: boolean | undefined = undefined;

        if (selectedBarber)
        {
            // Check if the selected barber is booked for this slot
            const barberBooking = bookingsForSlot.find(booking => booking.Barbers?.Id === selectedBarber.Id);
            if (barberBooking) {
                updatedStatus = barberBooking.Status; // can be true or false, both mean booked
            }
        } 
        else 
        {
            // No specific barber selected → Check all available barbers
            const bookedBarberIds = new Set(bookingsForSlot.map(booking => booking.Barbers?.Id));
            const availableBarbers = allBarbers.filter(barber => !bookedBarberIds.has(barber.Id));

            const noBarberBookedSlotsCount = bookingsForSlot.filter(booking => booking.Barbers === null).length;

            // If there are enough available barbers, mark as booked but not confirmed (false)
            if (availableBarbers.length <= noBarberBookedSlotsCount) {
                updatedStatus = false;
            }
        }

        allUpdatedSlots.push({ ...slot, Status: updatedStatus });
    }

    return allUpdatedSlots;
  }
  