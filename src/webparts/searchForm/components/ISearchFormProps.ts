import {
  ButtonClickedCallback,
  SearchButtonClickedCallback,
  IPageListItem,
  ICategory,
  IClassification
} from '../../../models'

export interface ISearchFormProps {
  pageListItem: IPageListItem[];
  categoryList: ICategory[];
  classificationList: IClassification[];
  onGetListItems?: ButtonClickedCallback;
  search?: SearchButtonClickedCallback;
  onGetCategory?: ButtonClickedCallback;
  onGetClassification?: ButtonClickedCallback;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
