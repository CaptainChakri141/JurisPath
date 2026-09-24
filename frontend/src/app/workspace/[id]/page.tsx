import React from 'react';
import WorkspaceClient from './WorkspaceClient';

export function generateStaticParams() {
  return [
    { id: 'sample_rental_1' },
    { id: 'sample_employment_1' },
    { id: 'sample_nda_1' },
    { id: 'sample_notice_1' },
  ];
}

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
