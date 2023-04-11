import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Popup } from "@progress/kendo-react-popup";
import { useEffect, useState, useRef } from "react";
import "./styles.css";
import { getListUser } from "../../../services/fetchData";
import { getAccountID, saveFilter } from "../../../services/service";
import LoadingPanel from "../../UI/LoadingPanel";
import useGetUsers from "../../../query-hooks/UserQuery";
import { Button } from "@progress/kendo-react-buttons";
import useGetCurrentUser from "../../../query-hooks/CurrentUserQuery";

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
        const filterWithUsers = {...selectedFilter, sharedUsers: sharedUsers};
        setIsLoading(true);
        saveFilter(filterWithUsers).then((()=>{
            setIsLoading(false);
            alert('Share complete');
            console.log(sharedUsers);
        }));
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
                alert('Can not add yourself to shared list');
                return;
            }

            // prevent add duplicate user to sharedUser
            const checkUser = sharedUsers.find(user => user.name === name);
            if (checkUser) {
                setCurrentInput('');
                alert('User is already added');
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
                style={{
                    width: "12vw",
                }}
                data={users}
                placeholder="Type name..."
                onChange={onChangeUser}
                value={currentInput}
                textField='name'  
            />
            <div>
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