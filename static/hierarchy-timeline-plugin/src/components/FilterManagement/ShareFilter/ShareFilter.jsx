import { showFlag } from "@forge/bridge";
import { Button } from "@progress/kendo-react-buttons";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Popup } from "@progress/kendo-react-popup";
import log from 'loglevel';
import { useEffect, useRef, useState } from "react";
import { SOMETHING_WENT_WRONG } from "../../../constants/flag-message";
import useGetCurrentUser from "../../../query-hooks/CurrentUserQuery";
import useGetUsers from "../../../query-hooks/UserQuery";
import { saveFilter } from "../../../services/service";
import LoadingPanel from "../../UI/LoadingPanel";
import "./styles.css";
import { showErrorFlag } from "../../../services/flag-service";

const ShareFilter = ({selectedFilter, fetchFilters}) => {
    const anchor = useRef(null);
    const [show, setShow] = useState(false);
    const [sharedUsers, setSharedUsers] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const {data: listUser} = useGetUsers();

    const {data: currentUserIdResponse} = useGetCurrentUser();

    useEffect(() => {
      if (currentUserIdResponse) {
        setCurrentUserId(currentUserIdResponse);
      }
  }, [currentUserIdResponse]);

    const share = (e) => {
        e.stopPropagation();
        setShow(!show);
    };

    const shareToUsers = () => {
      if(sharedUsers.length !== 0)
      {
        const filterWithUsers = {...selectedFilter, sharedUsers: sharedUsers};
        setIsLoading(true);
        saveFilter(filterWithUsers).then((()=>{
            setIsLoading(false);
            const flag = showFlag({
              id: 'success-flag',
              title: 'Note',
              type: 'success',
              description: 'Share complete.',
              isAutoDismiss: true,
            });
            console.log(sharedUsers);
            setSharedUsers([]);
        })).catch((e)=>{
          showErrorFlag(SOMETHING_WENT_WRONG);
          log.error(e);
          setIsLoading(false);
        });;
      }
      else
        {
          const flag = showFlag({
            id: 'warning-flag',
            title: 'Note',
            type: 'warning',
            description: 'Kindly select user to share filter.',
            isAutoDismiss: true,
          });
        }
    }

    useEffect(()=>{
        const {sharedUsers} = selectedFilter;
        if (sharedUsers) {
            setSharedUsers(sharedUsers);
        } else {
            setSharedUsers([]);
        }
    }, []);

    const isFilterOwner = () => {
      return currentUserId === selectedFilter?.ownerId
    }

    useEffect(() => {
        (async () => {
            setUsers(listUser);
        })();
    }, [listUser]);

    const onChangeUser = (event) => {
        setCurrentInput(event.target.value);

        if (event.nativeEvent.type === 'click' && event.target.value) {
            const name = event.target.value;

            // prevent add filter owner to sharedUser
            const ownerUser = users.find(user=> user.name === name);
            if (ownerUser.id === currentUserId) {
                setCurrentInput('');
                const flag = showFlag({
                  id: 'warning-flag',
                  title: 'Note',
                  type: 'warning',
                  description: 'Cannot add yourself to shared list.',
                  isAutoDismiss: true,
                });
                return;
            }

            // prevent add duplicate user to sharedUser
            const checkUser = sharedUsers.find(user => user.name === name);
            if (checkUser) {
                setCurrentInput('');
                const flag = showFlag({
                  id: 'warning-flag',
                  title: 'Note',
                  type: 'warning',
                  description: 'User is already added.',
                  isAutoDismiss: true,
                });
                return;
            }

            const user = users.find(user => user.name === name);
            const newList = sharedUsers.concat(user);

            setSharedUsers(newList);
            setCurrentInput('');
        }
    }

  const handleRemoveItem = (e, name) => {
      setSharedUsers(sharedUsers.filter(item => item.name !== name));
  };

    // hide popup
  const contentRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  const onClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (show) {
      contentRef.current.focus();
    }
  },[show]);

  const  onFocus = () => {
    // the user is still inside the content
    clearTimeout(blurTimeoutRef.current);
  };

  const  onBlurTimeout = () => {
    // the user is now outside the popup
    setShow(false);
  };

  const  onBlur = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = setTimeout(onBlurTimeout, 200);
  };

  // end hide popup

  // render the each shared user item
  const sharedUserRow = (user) => {
    return (
      <div key={user.id} className="filter-row">
        <div className="li-row">
          <div>{user.name}</div>
          <div>
            <Button
              disabled={!isFilterOwner}
              name={user.name}
              onClick={e => handleRemoveItem(e, user.name)}
              icon="delete"
            />
          </div>
        </div>
      </div>
    );
  };

    return (<>
        <button
            disabled={!selectedFilter}
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base share-btn"
            ref={anchor}
            onClick={(event)=> share(event) }
        >
          <span className="k-icon k-i-share"></span>
        </button>
        <Popup anchor={anchor.current} show={show} >
        <div
          className="popup-content"
          ref={contentRef}
          tabIndex={0}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={(e)=>{e.stopPropagation()}}
        >  
            {isLoading && <LoadingPanel/>}
            <AutoComplete
                data={users}
                placeholder="Type name..."
                onChange={onChangeUser}
                value={currentInput}
                textField='name'
                className="input-sharedfilter-user"
            />
            <div className="input-sharedfilterlist-user">
                {
                    sharedUsers.map(user => sharedUserRow(user))
                }
            </div>
            <div className="share-button-row">
                <Button
                    width="100%"
                    disabled={!isFilterOwner || !sharedUsers}
                    className="share-to-btn"
                    onClick={shareToUsers}
                >Save</Button>
            </div>
            </div>
        </Popup>
    </>
    );
}

export default ShareFilter;