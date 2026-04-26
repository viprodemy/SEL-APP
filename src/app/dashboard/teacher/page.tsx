import TeacherDashboardClient from "@/components/sel/teacher-dashboard-client";

export default function TeacherDashboardPage() {
    return (
        <div>
            <h1 className="text-4xl font-headline font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground mb-8">Class-wide emotional insights and trends.</p>
            <TeacherDashboardClient />
        </div>
    );
}
