const MESSAGE = {
    SUCCESS: {
        EMPLOYEES: {
            FETCHED: 'Employees fetched successfully',
            CREATED: 'Employee created successfully',
            UPDATED: 'Employee updated successfully',
            DELETED: 'Employee deleted successfully',
            STATS: 'Employee statistics fetched successfully',
            ALREADY_EXISTS: 'Email already exists'
        },
        DEPARTMENTS: {
            FETCHED: 'Department fetched successfully',
            CREATED: 'Department created successfully',
            UPDATED: 'Department updated successfully',
            DELETED: 'Department deleted successfully'
        }
    },
    ERROR: {
        EMPLOYEES: {
            NOT_FOUND: 'Employee not found',
            INVALID_ID: 'Invalid employee ID',
            FETCHED: 'Failed to fetched employee',
            CREATED: 'Failed to created employee',
            UPDATED: 'Failed to updated employee',
            DELETED: 'Failed to delete employee',
            STATS: 'Failed to fetch employee statistics',
        },
        DEPARTMENTS: {
            NOT_FOUND: 'Department not found',
            INVALID_ID: 'Invalid department ID',
            FETCHED: 'Failed to fetched department',
            CREATED: 'Failed to created department',
            UPDATED: 'Failed to updated department',
            DELETED: 'Failed to delete department',
        },
        VALIDATION: 'Validation Error',
        INTERNAL_SERVER: 'Internal Server Error'
    }
};

export default MESSAGE;