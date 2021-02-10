import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEndHandler,
} from 'react-sortable-hoc';
import isEmailTag from '../utils/is-email-tag';
import ReorderIcon from '../icons/reorder';
import TagListInput from './input';
import TrashIcon from '../icons/trash';
import { openTag, tagToTrash, toggleTagEditing } from '../state/ui/actions';

import * as selectors from './../state/selectors';

import type * as S from '../state';
import type * as T from '../types';

type StateProps = {
  editingTags: boolean;
  openedTag: T.TagHash | null;
  sortTagsAlpha: boolean;
  theme: 'light' | 'dark';
  tags: Map<T.TagHash, T.Tag>;
};

type DispatchProps = {
  onEditTags: () => any;
  openTag: (tagName: T.TagName) => any;
  reorderTag: (tagName: T.TagName, newIndex: number) => any;
  tagToTrash: (tagName: T.TagName | '') => any;
};

type Props = StateProps & DispatchProps;

const TagHandle = SortableHandle(() => <ReorderIcon />);

const SortableTag = SortableElement(
  ({
    allowReordering,
    editingActive,
    isSelected,
    selectTag,
    theme,
    trashTagConfirm,
    value: [tagHash, tag],
  }: {
    allowReordering: boolean;
    editingActive: boolean;
    isSelected: boolean;
    selectTag: (tagName: T.TagName) => any;
    theme: 'light' | 'dark';
    trashTagConfirm: (tagName: T.TagName) => any;
    value: [T.TagHash, T.Tag];
  }) => (
    <li
      key={tagHash}
      className={classNames(
        `tag-list-item`,
        `theme-color-border`,
        `theme-color-fg`,
        `theme-${theme}`
      )}
      data-tag-name={tag.name}
    >
      <TagListInput
        editable={editingActive}
        isSelected={isSelected}
        onClick={() => !editingActive && selectTag(tag.name)}
        tagName={tag.name}
      />
      {editingActive && (
        <button className="icon-button button-trash">
          <TrashIcon onClick={() => trashTagConfirm(tag.name)} />
        </button>
      )}
      {editingActive && allowReordering && (
        <button className="icon-button button-reorder theme-color-fg-dim">
          <TagHandle />
        </button>
      )}
    </li>
  )
);

const SortableTagList = SortableContainer(
  ({
    editingTags,
    items,
    openedTag,
    openTag,
    sortTagsAlpha,
    theme,
    tagToTrash,
  }: {
    editingTags: boolean;
    items: [T.TagHash, T.Tag][];
    openedTag: T.TagHash | null;
    openTag: (tagName: T.TagName) => any;
    sortTagsAlpha: boolean;
    theme: 'light' | 'dark';
    tagToTrash: (tagName: T.TagName | '') => any;
  }) => (
    <ul className="tag-list-items">
      {items.map((value, index) => (
        <SortableTag
          key={value[0]}
          allowReordering={!sortTagsAlpha}
          editingActive={editingTags}
          index={index}
          isSelected={openedTag === value[0]}
          selectTag={openTag}
          theme={theme}
          trashTagConfirm={tagToTrash}
          value={value}
        />
      ))}
    </ul>
  )
);

export class TagList extends Component<Props> {
  static displayName = 'TagList';

  reorderTag: SortEndHandler = ({ newIndex, nodes, oldIndex }) => {
    const tagName = nodes[oldIndex].node.dataset.tagName;
    this.props.reorderTag(tagName, newIndex);
  };

  render() {
    const {
      editingTags,
      onEditTags,
      openTag,
      openedTag,
      sortTagsAlpha,
      tags,
      theme,
      tagToTrash,
    } = this.props;

    const classes = classNames('tag-list', {
      'tag-list-editing': this.props.editingTags,
    });

    const sortedTags = Array.from(tags)
      .filter(([_, { name }]) => !isEmailTag(name))
      .sort(([aId, aTag], [bId, bTag]) =>
        sortTagsAlpha
          ? aTag.name.localeCompare(bTag.name)
          : 'undefined' !== typeof aTag.index &&
            'undefined' !== typeof bTag.index
          ? aTag.index - bTag.index
          : 'undefined' === typeof aTag.index
          ? 1
          : -1
      );

    return (
      <div className={classes}>
        <div className="tag-list-title theme-color-border">
          <h2 className="theme-color-fg">Tags</h2>
          {sortedTags.length > 0 && (
            <button
              className="tag-list-edit-toggle button button-borderless"
              tabIndex={0}
              onClick={onEditTags}
            >
              {editingTags ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
        <SortableTagList
          editingTags={editingTags}
          lockAxis="y"
          openedTag={openedTag}
          openTag={openTag}
          items={sortedTags}
          sortTagsAlpha={sortTagsAlpha}
          theme={theme}
          onSortEnd={this.reorderTag}
          useDragHandle={true}
          tagToTrash={tagToTrash}
        />
      </div>
    );
  }
}

const mapStateToProps: S.MapState<StateProps> = (state) => {
  const {
    data,
    settings: { sortTagsAlpha },
    ui: { editingTags, openedTag },
  } = state;
  return {
    editingTags,
    sortTagsAlpha,
    tags: data.tags,
    openedTag,
    theme: selectors.getTheme(state),
  };
};

const mapDispatchToProps: S.MapDispatch<DispatchProps> = {
  onEditTags: toggleTagEditing,
  openTag: openTag,
  reorderTag: (tagName, newIndex) => ({
    type: 'REORDER_TAG',
    tagName,
    newIndex,
  }),
  tagToTrash: tagToTrash,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
