import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartmentById,
  createDepartment,
  updateDepartment,
} from '../services/departmentService';
import { Department } from '../@types/department.interface';
import { ApiError } from '../@types/index.interface';

interface UseDepartmentFormProps {
  id?: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive'], 'Invalid status'),
});

export const useDepartmentForm = ({ id }: UseDepartmentFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: department, isLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartmentById(id!),
    enabled: isEditing,
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      navigate('/departments');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
      navigate('/departments');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: department?.name || '',
      status: department?.status || 'active',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEditing && id) {
          await updateMutation.mutateAsync({
            id: Number(id),
            ...values,
          });
        } else {
          await createMutation.mutateAsync(values as Department);
        }
      } catch (error) {
        const apiError = error as ApiError;
        formik.setStatus(
          apiError.response?.data?.message ||
            apiError.message ||
            'Failed to save department. Please try again.',
        );
      }
    },
  });

  return {
    formik,
    isEditing,
    isLoading,
    error: formik.status,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
