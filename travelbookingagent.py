class TravelBookingAgent:

    def __init__(self):
        self.booking = {}

    def greet(self):
        print("=" * 50)
        print("🤖 Smart Travel Booking Agent")
        print("=" * 50)

    def choose_transport(self):
        print("\n1. Flight ✈️")
        print("2. Train 🚆")
        print("3. Bus 🚌")
        print("4. Car 🚗")

        modes = {
            "1": "Flight",
            "2": "Train",
            "3": "Bus",
            "4": "Car"
        }

        while True:
            choice = input("Choose transport (1-4): ")

            if choice in modes:
                self.booking["Transport"] = modes[choice]
                break

            print("❌ Invalid choice")

    def collect_details(self):
        self.booking["Source"] = input("Enter Source City: ")
        self.booking["Destination"] = input("Enter Destination City: ")
        self.booking["Travel Date"] = input("Enter Travel Date: ")
        self.booking["Passengers"] = int(input("Enter Passengers: "))

        transport = self.booking["Transport"]

        if transport == "Flight":
            self.booking["Class"] = input("Class (Economy/Business): ")

        elif transport == "Train":
            self.booking["Coach"] = input("Coach (Sleeper/3AC/2AC/1AC): ")

        elif transport == "Bus":
            self.booking["Seat"] = input("Seat (Seater/Sleeper): ")

        else:
            self.booking["Car"] = input("Car (Sedan/SUV/Hatchback): ")

    def estimate_price(self):
        prices = {
            "Flight": 5000,
            "Train": 800,
            "Bus": 600,
            "Car": 3000
        }

        transport = self.booking["Transport"]
        passengers = self.booking["Passengers"]

        self.booking["Estimated Price"] = prices[transport] * passengers

    def confirm_booking(self):
        print("\n" + "=" * 50)
        print("📋 BOOKING SUMMARY")
        print("=" * 50)

        for key, value in self.booking.items():
            print(f"{key:20}: {value}")

        choice = input("\nConfirm Booking? (yes/no): ")

        if choice.lower() == "yes":
            print("\n✅ Booking Confirmed!")
        else:
            print("\n❌ Booking Cancelled.")

    def run(self):
        self.greet()
        self.choose_transport()
        self.collect_details()
        self.estimate_price()
        self.confirm_booking()

print("LAVANYA M - 24104069");
agent = TravelBookingAgent()
agent.run()