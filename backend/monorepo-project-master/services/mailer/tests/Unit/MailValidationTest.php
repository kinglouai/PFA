<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class MailValidationTest extends TestCase
{
    public function test_valid_email_format(): void
    {
        $this->assertTrue(filter_var('user@example.com', FILTER_VALIDATE_EMAIL) !== false);
    }

    public function test_invalid_email_format(): void
    {
        $this->assertFalse(filter_var('not-an-email', FILTER_VALIDATE_EMAIL));
    }

    public function test_subject_length(): void
    {
        $subject = str_repeat('a', 255);
        $this->assertLessThanOrEqual(255, strlen($subject));
    }
}
