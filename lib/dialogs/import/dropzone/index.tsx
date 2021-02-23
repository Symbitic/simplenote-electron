import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import CloudIcon from '../../../icons/cloud';
import GridiconWarn from '../../../icons/warning';
import FileIcon from '../../../icons/file';
import { useDropzone } from 'react-dropzone';

function ImporterDropzone({
  acceptedTypes,
  locked,
  multiple,
  onAccept,
  onReset,
}) {
  const [acceptedFile, setAcceptedFile] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const handleAccept = (acceptedFiles) => {
    let hasSimplenote = 0;
    let hasEvernote = 0;

    let filteredFiles = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileExtension =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      if (fileExtension === 'json') {
        if (hasSimplenote === 0) {
          filteredFiles.push(file);
        }
        hasSimplenote++;
      } else if (fileExtension === 'enex') {
        if (hasEvernote === 0) {
          filteredFiles.push(file);
        }
        hasEvernote++;
      } else {
        filteredFiles.push(file);
      }
    }
    //const fileCount = filteredFiles.length;
    //const label = fileCount > 1 ? `${fileCount} files` : filteredFiles[0].name;

    setAcceptedFile(filteredFiles);
    onAccept(filteredFiles);
  };

  const handleReject = (rejectedFiles) => {
    if (!multiple && rejectedFiles.length > 1) {
      setErrorMessage('Choose a single file');
    } else {
      setErrorMessage('File type is incorrect');
    }
    setAcceptedFile(undefined);
    onReset();
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length === 0) {
      handleReject(rejectedFiles);
    } else {
      handleAccept(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    disabled: locked,
    multiple,
    onDrop,
  });

  useEffect(() => {
    if (!errorMessage) {
      return;
    }
    const timer = setTimeout(() => setErrorMessage(undefined), 2500);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const text = errorMessage
    ? errorMessage
    : 'Drag and drop to upload files, or click to choose';

  const DropzonePlaceholder = () => (
    <Fragment>
      {errorMessage ? <GridiconWarn /> : <CloudIcon />}
      {isDragActive ? 'Drop files here' : text}
    </Fragment>
  );

  const FilesWithIcon = () => {
    const fileList = acceptedFile.map((file: File) => (
      <li key={file.name}>
        <FileIcon />
        {file.name}
      </li>
    ));
    return (
      <Fragment>
        <div className="accepted-files-header">
          Import File{acceptedFile.length > 1 ? 's' : ''}
        </div>
        <ul className="accepted-files">{fileList}</ul>
      </Fragment>
    );
  };

  return (
    <div
      {...getRootProps()}
      className={classnames(
        { 'is-accepted': acceptedFile },
        'importer-dropzone theme-color-border'
      )}
    >
      <input {...getInputProps()} />
      {acceptedFile ? <FilesWithIcon /> : <DropzonePlaceholder />}
    </div>
  );
}

ImporterDropzone.propTypes = {
  acceptedTypes: PropTypes.string,
  locked: PropTypes.bool.isRequired,
  multiple: PropTypes.bool,
  onAccept: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default ImporterDropzone;
