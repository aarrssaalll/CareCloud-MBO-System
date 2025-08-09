import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-primary">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary">CareCloud</h1>
              <span className="ml-4 text-lg text-text-light">MBO System</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="/login" className="btn-primary">
                Login
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-text mb-6">
            Automated Management by Objectives
          </h2>
          <p className="text-xl text-text-light mb-12 max-w-3xl mx-auto">
            Streamline your performance management process with our comprehensive 
            MBO reporting system. Set objectives, track progress, and automate 
            evaluations with AI-powered insights.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="card">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Objective Management</h3>
              <p className="text-text-light">Set, track, and manage objectives across all organizational levels</p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">AI-Powered Scoring</h3>
              <p className="text-text-light">Intelligent evaluation and scoring based on objective completion</p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Role-Based Access</h3>
              <p className="text-text-light">Secure access control for employees, managers, HR, and executives</p>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Comprehensive Reporting</h3>
              <p className="text-text-light">Detailed analytics and reports for informed decision making</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16">
            <Link href="/login" className="btn-primary text-lg px-8 py-3">
              Get Started Today
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
