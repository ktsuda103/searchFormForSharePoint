import {
  ButtonClickedCallback,
  SearchButtonClickedCallback,
  IPageListItem,
  ICategory
} from '../../../models'

export interface ISearchFormProps {
  pageListItem: IPageListItem[];
  categoryList:ICategory[],
  onGetListItems?: ButtonClickedCallback;
  search?:SearchButtonClickedCallback;
  onGetCategory?:ButtonClickedCallback;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
