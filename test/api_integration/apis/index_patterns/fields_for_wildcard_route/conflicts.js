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

import expect from '@osd/expect';

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearchArchiver = getService('opensearchArchiver');

  describe('conflicts', () => {
    before(() => opensearchArchiver.load('index_patterns/conflicts'));
    after(() => opensearchArchiver.unload('index_patterns/conflicts'));

    it('flags fields with mismatched types as conflicting', () =>
      supertest
        .get('/api/index_patterns/_fields_for_wildcard')
        .query({ pattern: 'logs-*' })
        .expect(200)
        .then((resp) => {
          expect(resp.body).to.eql({
            fields: [
              {
                name: '@timestamp',
                type: 'date',
                opensearchTypes: ['date'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'number_conflict',
                type: 'number',
                opensearchTypes: ['integer', 'float'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'string_conflict',
                type: 'string',
                opensearchTypes: ['text', 'keyword'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: false,
              },
              {
                name: 'success',
                type: 'conflict',
                opensearchTypes: ['boolean', 'keyword'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: false,
                conflictDescriptions: {
                  boolean: ['logs-2017.01.02'],
                  keyword: ['logs-2017.01.01'],
                },
              },
            ],
          });
        }));
  });
}
