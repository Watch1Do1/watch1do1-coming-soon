export const emailService = {
    sendEmailKit: async (email: string, title: string, items: any[]) => {
        console.log(`Sending kit for ${title} to ${email}`);
        return true;
    },
    sendContactEmail: async (name: string, email: string, message: string) => {
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });
            return response.ok;
        } catch (error) {
            console.error("Error sending contact email:", error);
            return false;
        }
    }
};
