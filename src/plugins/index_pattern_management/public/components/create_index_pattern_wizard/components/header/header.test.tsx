/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import { Header } from '../header';
import { mount } from 'enzyme';
import { OpenSearchDashboardsContextProvider } from 'src/plugins/opensearch_dashboards_react/public';
import { mockManagementPlugin } from '../../../../mocks';
import { DocLinksStart } from 'opensearch-dashboards/public';

describe('Header', () => {
  const indexPatternName = 'test index pattern';
  const mockedContext = mockManagementPlugin.createIndexPatternManagmentContext();
  const mockedDocLinks = {
    links: {
      indexPatterns: {},
    },
  } as DocLinksStart;

  it('should render normally', () => {
    const component = mount(
      <Header indexPatternName={indexPatternName} docLinks={mockedDocLinks} />,
      {
        wrappingComponent: OpenSearchDashboardsContextProvider,
        wrappingComponentProps: {
          services: mockedContext,
        },
      }
    );

    expect(component).toMatchSnapshot();
  });

  it('should render without including system indices', () => {
    const component = mount(
      <Header indexPatternName={indexPatternName} docLinks={mockedDocLinks} />,
      {
        wrappingComponent: OpenSearchDashboardsContextProvider,
        wrappingComponentProps: {
          services: mockedContext,
        },
      }
    );

    expect(component).toMatchSnapshot();
  });

  it('should render a different name, prompt, and beta tag if provided', () => {
    const component = mount(
      <Header
        prompt={<div>Test prompt</div>}
        indexPatternName={indexPatternName}
        isBeta={true}
        docLinks={mockedDocLinks}
      />,
      {
        wrappingComponent: OpenSearchDashboardsContextProvider,
        wrappingComponentProps: {
          services: mockedContext,
        },
      }
    );

    expect(component).toMatchSnapshot();
  });
});
