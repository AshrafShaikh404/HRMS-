const PERMISSIONS = {
    employee: [
        'view_dashboard_employee',
        'view_profile',
        'edit_profile',
        'view_attendance_own',
        'view_leaves_own',
        'apply_leave',
        'view_payroll_own',
        'create_ticket',
        'view_tickets_own',
        'view_holidays'
    ],
    hr: [
        'view_dashboard_hr',
        'view_profile',
        'edit_profile',
        'manage_employees',
        'view_employees',
        'manage_attendance', // Can check in/out for others? Maybe just view/approve
        'view_attendance_all',
        'manage_leaves', // Approve/Reject
        'view_leaves_all',
        'view_payroll_own', // HR uses own payroll too?
        'view_payroll_all', // Can view others
        'approve_payroll',
        'manage_tickets',
        'view_tickets_all',
        'view_holidays'
    ],
    admin: [
        'view_dashboard_admin',
        'view_profile',
        'edit_profile',
        'manage_users', // Create/Delete users
        'manage_employees',
        'view_employees',
        'manage_attendance',
        'view_attendance_all',
        'manage_leaves',
        'view_leaves_all',
        'manage_payroll',
        'view_payroll_all',
        'approve_payroll',
        'manage_tickets',
        'view_tickets_all',
        'manage_settings',
        'view_holidays'
    ]
};

module.exports = PERMISSIONS;
