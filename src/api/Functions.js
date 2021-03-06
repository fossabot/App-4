//API
import { ALL_FORMS_QUERY, FORM_DATA_QUERY } from "./Queries";
//Utilities
import LogRocket from "logrocket";

/*
* This file contains all the global functions and actions to the servers that are used on all the project
* */

//USER

//this functions login in the user
const userSignIn = async (email, password, signinUser) => {
  try {
    let confirmed = "";
    let rest = null;
    await signinUser({
      variables: {
        email,
        password
      },
      update: (store, { data: { signinUser } }) => {
        try {
          window.localStorage.setItem("graphcoolToken", signinUser.token);
          confirmed = signinUser.user.confirmed;
          rest = signinUser.user;
          //LogRocket
          LogRocket.identify(signinUser.user.id, {
            name: signinUser.user.userName,
            email: signinUser.user.email
          });
        } catch (e) {
          return e;
        }
      }
    });
    return { status: true, confirmed, rest };
  } catch (e) {
    return { status: false };
  }
};

//FORMS

//this functions deletes the selected form by the user
const deleteForm = async (id, userId, deleteFormMutation) => {
  //deletes the form in the DB
  try {
    await deleteFormMutation({
      variables: {
        id
      },
      update: (store, { data: { deleteForms } }) => {
        try {
          //reads the query from the cache
          const data = store.readQuery({
            query: ALL_FORMS_QUERY,
            variables: { userId }
          });
          //finds and removes the form from the object
          data.allFormses.forEach((value, index) => {
            if (value.id === deleteForms.id) {
              data.allFormses.splice(index, 1);
            }
          });
          //updates the new data to the store
          store.writeQuery({
            query: ALL_FORMS_QUERY,
            variables: { userId },
            data
          });
        } catch (e) {
          LogRocket.error({ deleteForm: e });
          return e;
        }
      }
    });
    return true;
  } catch (e) {
    return e;
  }
};

//this functions deletes the selected content from a form
const deleteFormContent = async (id, formId, deleteFormContentMutation) => {
  //deletes the form in the DB
  try {
    await deleteFormContentMutation({
      variables: {
        id
      },
      update: (store, { data: { deleteContent } }) => {
        try {
          //reads the query from the cache
          const data = store.readQuery({
            query: FORM_DATA_QUERY,
            variables: { id: formId }
          });
          //finds and removes the form from the object
          data.Forms.contents.forEach((value, index) => {
            if (value.id === deleteContent.id) {
              data.Forms.contents.splice(index, 1);
            }
          });
          //updates the new data to the store
          store.writeQuery({
            query: FORM_DATA_QUERY,
            variables: { id: formId },
            data
          });
        } catch (e) {
          return e;
        }
      }
    });
    return true;
  } catch (e) {
    return e;
  }
};

export { deleteForm, deleteFormContent, userSignIn };
