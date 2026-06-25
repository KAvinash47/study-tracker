# 🎓 MetricStudy - Advanced WebGL Study Tracking Dashboard

MetricStudy is a high-fidelity, visually stunning study tracking portal built using **React**, **WebGL (React Three Fiber & Drei)**, **Framer Motion**, and **Chart.js**. It features a modern dark glassmorphic design and reactive 3D shapes to provide an engaging, gamified interface for tracking learning goals.

---

## 🌟 Key Features

1. **Interactive 3D WebGL Background**:
   * Uses `@react-three/fiber` and `@react-three/drei` to render metallic floaters and reactive star clouds that respond to time and clock ticks.
2. **Today's Focus & Attendance Log**:
   * Standard attendance logging: Did you study today?
     * **If Yes**: Log study hours (using a slider) and specify the topics learned.
     * **If No**: Select a category/reason for skipping (e.g., social media distraction, lazy, illness, travel) and write down reviews/notes.
   * Includes a dynamic SVG progress ring tracking hours studied against the daily target.
3. **Daily Task Checklist**:
   * An interactive, animated to-do list to track immediate goals with progress metrics.
4. **Weekly Targets Config**:
   * Configurable target hour settings for all 7 days of the week, with progress bars indicating completion status.
5. **Subject-wise Syllabus Tracker**:
   * Custom tree-structure checklist categorized by subjects.
   * Track chapters as *Not Started*, *In Progress*, or *Completed* to display overall subject completion rates.
6. **Performance Analytics & Reporting**:
   * Displays total hours studied, attendance rate, and skipped days.
   * **Daily Study Hours Chart**: An interactive bar chart comparing target vs. actual hours studied using `react-chartjs-2`.
   * **Distraction Distribution Chart**: A doughnut chart categorizing the reasons for skipping study days.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React (scaffolded via Vite)
* **3D/WebGL Graphics**: Three.js, React Three Fiber, Drei
* **Interactive Charts**: Chart.js, React-Chartjs-2
* **Animations**: Framer Motion
* **Iconography**: Lucide React
* **Styling**: Modern CSS Custom Properties (Dark Glassmorphic UI theme)

---

## 💻 Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KAvinash47/study-tracker.git
   cd study-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔗 Deployment

This project is configured for deployment on **Vercel**:

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import the repository **`KAvinash47/study-tracker`**.
4. Click **Deploy**. Vercel will automatically build the Vite production bundle and host it live.
