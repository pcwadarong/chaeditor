export type PublishMode = 'immediate' | 'scheduled';

/**
 * Returns local date and time strings for the publish panel defaults.
 */
export const getInitialScheduleFields = (publishAt: string | null, now: Date = new Date()) => {
  if (!publishAt) {
    return {
      dateInput: '',
      publishMode: 'immediate' as PublishMode,
      timeInput: '',
    };
  }

  const scheduledDate = new Date(publishAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    return {
      dateInput: '',
      publishMode: 'immediate' as PublishMode,
      timeInput: '',
    };
  }

  if (scheduledDate.getTime() <= now.getTime()) {
    return {
      dateInput: '',
      publishMode: 'immediate' as PublishMode,
      timeInput: '',
    };
  }

  const year = `${scheduledDate.getFullYear()}`;
  const month = `${scheduledDate.getMonth() + 1}`.padStart(2, '0');
  const date = `${scheduledDate.getDate()}`.padStart(2, '0');
  const hours = `${scheduledDate.getHours()}`.padStart(2, '0');
  const minutes = `${scheduledDate.getMinutes()}`.padStart(2, '0');

  return {
    dateInput: `${year}-${month}-${date}`,
    publishMode: 'scheduled' as PublishMode,
    timeInput: `${hours}:${minutes}`,
  };
};

/**
 * Returns the minimum date-time string allowed by the publish schedule fields.
 */
export const getLocalScheduleMinFields = (now: Date = new Date()) => {
  const year = `${now.getFullYear()}`;
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const date = `${now.getDate()}`.padStart(2, '0');
  const hours = `${now.getHours()}`.padStart(2, '0');
  const minutes = `${now.getMinutes()}`.padStart(2, '0');

  return {
    minDateInput: `${year}-${month}-${date}`,
    minTimeInput: `${hours}:${minutes}`,
  };
};
