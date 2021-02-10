import actions from 'lib/state/actions';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { closeDialog, tagToTrash } from '../../../lib/state/ui/actions';
import Dialog from '../../dialog';

import type * as S from '../../state';
import type * as T from '../../types';

type StateProps = {
  tagToTrash: T.TagName;
};

type DispatchProps = {
  closeDialog: () => any;
  trashTag: (tagName: T.TagName) => any;
};

type Props = StateProps & DispatchProps;

const TrashTagConfirmation: FunctionComponent<Props> = ({
  closeDialog,
  tagToTrash,
  trashTag,
}) => (
  <Dialog
    className="trash-tag-confirmation"
    onDone={closeDialog}
    title="Delete Tag"
  >
    <div>Are you sure you want to delete this tag?</div>
    <button
      className="button-primary delete-tag"
      onClick={() => {
        trashTag(tagToTrash);
        closeDialog();
      }}
    >
      Delete
    </button>
  </Dialog>
);

const mapStateToProps: S.MapState<StateProps> = (state) => ({
  tagToTrash: state.ui.tagToTrash,
});

const mapDispatchToProps: S.MapDispatch<DispatchProps> = {
  trashTag: (tagName) => ({
    type: 'TRASH_TAG',
    tagName,
  }),
  closeDialog: closeDialog,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrashTagConfirmation);
