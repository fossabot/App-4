// @flow
import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import * as moment from "moment";
//Components
import { Header } from "../components/atoms/index";
import {
  Placeholder,
  PlaceholderAnimation,
  Card
} from "../components/molecules/index";
//API
import { ALL_FORMS_QUERY } from "../api/Queries";

class MyForms extends Component {
  props: {
    allFormsQuery: any,
  };
  state = {
    loading: true,
    loadingTimeout: 0,
    hasError: "",
    data: []
  };
  _LoadingAnimationContent = (type: string = "loading", length: number = 6) => {
    const content = [];
    for (let i = 0; i <= length; i++) {
      if (type !== "loading") {
        content.push(<Placeholder key={i} width={208} height={192} />);
      } else {
        content.push(<PlaceholderAnimation key={i} />);
      }
    }
    return content;
  };
  _loadContent = _ => {
    const { _formsesMeta, formses } = this.props.allFormsQuery.user;
    const content = [];
    let length = 0;
    //checks if the number of forms created from the user
    if (_formsesMeta.count <= 0 && Object.keys(formses).length === 0) {
      return this._LoadingAnimationContent("normal");
    }
    //Checks if the object data is not empty
    if (Object.keys(formses).length >= 0) {
      formses.map(res => {
        content.push(
          <Card
            key={res.id}
            title={res.name}
            date={moment(res.createdAt).format("ll")}
            onClick={() => this.props.router.push(`/form/${res.id}`)}
          />
        );
      });
      //for interface
      if (_formsesMeta.count < 6) {
        length = 6 - Number(_formsesMeta.count);
      }
      return content.concat(this._LoadingAnimationContent("normal", length));
    }
  };
  render() {
    if (this.props.allFormsQuery && this.props.allFormsQuery.error) {
      return <div>Ups! Something went wrong try again.</div>;
    }
    return (
      <div className="row">
        <div className="col-md-12 col-sm-12 col">
          <Header text="My Forms" />
          <Card
            icon="fa-plus"
            title="New Form"
            date="Create from scratch"
            onClick={() => this.props.router.push("/new")}
            new
          />
          {this.props.allFormsQuery.loading
            ? this._LoadingAnimationContent()
            : <div>
                {this._loadContent()}
              </div>}
        </div>
      </div>
    );
  }
}

const MyFormsWithData = compose(
  graphql(ALL_FORMS_QUERY, { name: "allFormsQuery" }),
)(MyForms);

export default MyFormsWithData;
