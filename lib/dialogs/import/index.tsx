import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';

import Dialog from '../../dialog';
import SourceImporter from './source-importer';
import { closeDialog } from '../../state/ui/actions';

import * as S from '../../state';

type DispatchProps = {
  closeDialog: () => any;
};

type Props = DispatchProps;

class ImportDialog extends Component<Props> {
  state = {
    importStarted: false,
  };

  render() {
    const { closeDialog } = this.props;
    const { importStarted } = this.state;
    const source = {
      name: 'Note Importer',
      slug: 'plaintext',
      acceptedTypes: '.txt,.md',
      instructions:
        'Choose a simplenote export file (.json) or one or more text files (txt, md).',
      multiple: true,
    };

    return (
      <Dialog
        className="import"
        closeBtnLabel={importStarted ? '' : 'Cancel'}
        onDone={importStarted ? undefined : closeDialog}
        title="Import Notes"
      >
        <div className="import__inner">
          <SourceImporter
            locked={importStarted}
            onClose={closeDialog}
            onStart={() => this.setState({ importStarted: true })}
            source={source}
          />
        </div>
      </Dialog>
    );
  }
}

const mapDispatchToProps: S.MapDispatch<DispatchProps> = {
  closeDialog,
};

export default connect(null, mapDispatchToProps)(ImportDialog);
