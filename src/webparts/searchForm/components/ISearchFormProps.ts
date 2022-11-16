import {
  ButtonClickedCallback,
  SearchButtonClickedCallback,
  IPageListItem,
  ICategory,
  IClassification,
  IBU
} from '../../../models'

export interface ISearchFormProps {
  pageListItem: IPageListItem[];
  categoryList: ICategory[];
  classificationList: IClassification[];
  buList: IBU[];
  onGetListItems?: ButtonClickedCallback;
  search?: SearchButtonClickedCallback;
  onGetCategory?: ButtonClickedCallback;
  onGetClassification?: ButtonClickedCallback;
  onGetBU?: ButtonClickedCallback;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
