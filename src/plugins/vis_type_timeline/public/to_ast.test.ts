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

import { Vis } from 'src/plugins/visualizations/public';
import { TimelineVisParams } from './timeline_vis_fn';
import { toExpressionAst } from './to_ast';

describe('timeline vis toExpressionAst function', () => {
  let vis: Vis<TimelineVisParams>;

  beforeEach(() => {
    vis = {
      params: {
        expression: '.opensearch(*)',
        interval: 'auto',
      },
    } as any;
  });

  it('should match basic snapshot', () => {
    const actual = toExpressionAst(vis);
    expect(actual).toMatchSnapshot();
  });

  it('should not escape single quotes', () => {
    vis.params.expression = `.opensearch(index=my*,timefield="date",split='test field:3',metric='avg:value')`;
    const actual = toExpressionAst(vis);
    expect(actual).toMatchSnapshot();
  });
});
