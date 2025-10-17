export interface JobData {
  timestamp: number; // Unix timestamp
  jobLink: string;
  additionalInfo: string;
  includeSalaryRange: string;
  salaryRange: string;
  employerName: string;
  jobTitle: string;
  workingStyle: string;
  compensationInfo: string;
  compliancePlan: string;
  contactSlack: string;
  roleType: string;
  visaSponsorship: string;
  hiringProcess: string;
  compLow: string;
  compHigh: string;
}

export const parseJSON = (jsonText: string): JobData[] => {
  try {
    const jobs: JobData[] = JSON.parse(jsonText);
    return jobs;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

export const fetchJobData = async (): Promise<JobData[]> => {
  try {
    const response = await fetch('/job_data.json');
    const jsonText = await response.text();
    return parseJSON(jsonText);
  } catch (error) {
    console.error('Error fetching job data:', error);
    return [];
  }
};
