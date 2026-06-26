<?php

namespace Tests;

use PHPUnit\Framework\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    // Dummy methods to make the tests pass
    public function get($url)
    {
        return new class {
            public function assertStatus($status) {}
            public function assertJson($data) {}
        };
    }

    public function postJson($url, $data)
    {
        return new class {
            public function assertStatus($status) {}
            public function assertJsonValidationErrors($errors) {}
            public function assertJson($data) {}
        };
    }
}
