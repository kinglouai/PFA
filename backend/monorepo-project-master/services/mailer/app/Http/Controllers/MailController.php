<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MailController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'to'      => 'required|email',
            'subject' => 'required|string|max:255',
            'body'    => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success'   => true,
            'message'   => 'Email queued successfully',
            'recipient' => $request->input('to'),
        ]);
    }

    public function health(): JsonResponse
    {
        return response()->json([
            'status'  => 'ok',
            'service' => 'mailer',
        ]);
    }
}
